begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 name text not null default '', phone text not null default '', address text not null default ''
);
create table public.products (
 id text primary key, brand text not null, name text not null, color text not null,
 category text not null, description text not null, image text not null, gallery jsonb,
 price_kobo bigint not null check(price_kobo > 0), active boolean not null default true
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id text not null references public.products,
 size integer not null, stock integer not null check(stock >= 0), unique(product_id,size)
);
create table public.cart_items (
 user_id uuid not null references auth.users on delete cascade,
 variant_id uuid not null references public.product_variants,
 quantity integer not null check(quantity between 1 and 10), primary key(user_id,variant_id)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users,
 status text not null default 'pending' check(status in ('pending','paid')),
 mode text not null check(mode in ('test','live','demo')), currency text not null default 'NGN',
 total_kobo bigint not null check(total_kobo > 0), delivery jsonb not null,
 created_at timestamptz not null default now(), paid_at timestamptz
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders,
 variant_id uuid not null references public.product_variants, name text not null, size integer not null,
 quantity integer not null, unit_price_kobo bigint not null
);
create table public.payments (
 reference uuid primary key default gen_random_uuid(), order_id uuid unique not null references public.orders,
 mode text not null, amount_kobo bigint not null, status text not null default 'pending',
 provider_id text, verified_at timestamptz
);
create table public.email_events (
 id uuid primary key default gen_random_uuid(), dedupe_key text unique not null,
 user_id uuid not null references auth.users, order_id uuid references public.orders,
 kind text not null check(kind in ('welcome','receipt')), status text not null default 'pending'
 check(status in ('pending','sending','sent','failed')), attempts integer not null default 0,
 last_error text, created_at timestamptz not null default now(), sent_at timestamptz
);
create function public.create_customer() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));
 insert into public.email_events(dedupe_key,user_id,kind) values('welcome:'||new.id,new.id,'welcome') on conflict do nothing;
 return new;
end $$;
create trigger create_customer after insert on auth.users for each row execute function public.create_customer();
insert into public.profiles(id,name) select id,coalesce(raw_user_meta_data->>'full_name','') from auth.users on conflict do nothing;
insert into public.email_events(dedupe_key,user_id,kind) select 'welcome:'||id,id,'welcome' from auth.users on conflict do nothing;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.email_events enable row level security;
revoke all on public.profiles,public.products,public.product_variants,public.cart_items,public.orders,public.order_items,public.payments,public.email_events from anon,authenticated;
grant select on public.products,public.product_variants to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.cart_items to authenticated;
grant select on public.orders,public.order_items,public.payments to authenticated;
grant all on public.profiles,public.products,public.product_variants,public.cart_items,public.orders,public.order_items,public.payments,public.email_events to service_role;
create policy catalog on public.products for select using(active);
create policy variants on public.product_variants for select using(exists(select 1 from public.products where id=product_id and active));
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy edit_profile on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy own_cart on public.cart_items for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_orders on public.orders for select to authenticated using(user_id=auth.uid());
create policy own_items on public.order_items for select to authenticated using(exists(select 1 from public.orders where id=order_id and user_id=auth.uid()));
create policy own_payments on public.payments for select to authenticated using(exists(select 1 from public.orders where id=order_id and user_id=auth.uid()));
create function public.prepare_order(customer uuid, payment_mode text, email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare p public.profiles; oid uuid; ref uuid; total bigint; item record;
begin
 select * into p from public.profiles where id=customer for update;
 if not found or length(trim(p.name))=0 or length(trim(p.phone))=0 or length(trim(p.address))=0 then raise exception 'Complete your delivery details'; end if;
 if payment_mode not in ('test','live','demo') then raise exception 'Invalid payment mode'; end if;
 total:=0;
 for item in select c.quantity,v.stock,pr.price_kobo,pr.active from public.cart_items c join public.product_variants v on v.id=c.variant_id join public.products pr on pr.id=v.product_id where c.user_id=customer loop
  if not item.active or item.quantity>item.stock then raise exception 'An item is unavailable'; end if;
  total:=total+item.price_kobo*item.quantity;
 end loop;
 if total=0 then raise exception 'Your bag is empty'; end if;
 insert into public.orders(user_id,mode,total_kobo,delivery) values(customer,payment_mode,total,jsonb_build_object('name',p.name,'phone',p.phone,'address',p.address,'email',email)) returning id into oid;
 insert into public.order_items(order_id,variant_id,name,size,quantity,unit_price_kobo)
 select oid,v.id,pr.brand||' '||pr.name,v.size,c.quantity,pr.price_kobo from public.cart_items c join public.product_variants v on v.id=c.variant_id join public.products pr on pr.id=v.product_id where c.user_id=customer;
 insert into public.payments(order_id,mode,amount_kobo) values(oid,payment_mode,total) returning reference into ref;
 return jsonb_build_object('order_id',oid,'reference',ref,'amount',total);
end $$;
create function public.complete_payment(payment_reference uuid, verified_amount bigint, verified_currency text, verified_mode text, provider text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare p public.payments; o public.orders;
begin
 select * into p from public.payments where reference=payment_reference for update;
 if not found then raise exception 'Unknown reference'; end if;
 select * into o from public.orders where id=p.order_id for update;
 if p.amount_kobo<>verified_amount or o.currency<>verified_currency or p.mode<>verified_mode then raise exception 'Payment mismatch'; end if;
 if p.status='paid' then return o.id; end if;
 update public.payments set status='paid',provider_id=provider,verified_at=now() where reference=payment_reference;
 update public.orders set status='paid',paid_at=now() where id=o.id;
 -- Test/demo transactions never consume real inventory. Live launch requires stock reservation.
 if verified_mode='live' then raise exception 'Live payments are not enabled for this demo'; end if;
 insert into public.email_events(dedupe_key,user_id,order_id,kind) values('receipt:'||o.id,o.user_id,o.id,'receipt') on conflict do nothing;
 delete from public.cart_items c using public.order_items i where i.order_id=o.id and c.user_id=o.user_id and c.variant_id=i.variant_id and c.quantity=i.quantity;
 return o.id;
end $$;
revoke all on function public.create_customer(),public.prepare_order(uuid,text,text),public.complete_payment(uuid,bigint,text,text,text) from public,anon,authenticated;
grant execute on function public.prepare_order(uuid,text,text),public.complete_payment(uuid,bigint,text,text,text) to service_role;
commit;
