-- Existing Kicks store only: base commerce and email migrations must already be applied.
-- Adds private cart invalidations and four demo shoe fixtures; no customer data or credentials.
-- Run outputs/supabase-readiness.sql first; do not rerun the base commerce schema.

begin;
-- Apply after the base commerce schema. Re-running preserves existing policies.
-- Private invalidations include no cart data.
do $$
begin
 if not exists (select 1 from pg_policies where schemaname='realtime' and tablename='messages' and policyname='kicks_receive_own_cart') then
  create policy kicks_receive_own_cart on realtime.messages
  for select to authenticated
  using (extension = 'broadcast' and realtime.topic() = 'cart:' || (select auth.uid())::text);
 end if;
end;
$$;

create or replace function public.notify_cart_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 perform realtime.send('{}'::jsonb, 'changed', 'cart:' || coalesce(new.user_id, old.user_id)::text, true);
 return null;
end;
$$;
revoke all on function public.notify_cart_change() from public, anon, authenticated;
do $$
begin
 if not exists (select 1 from pg_trigger where tgrelid='public.cart_items'::regclass and tgname='kicks_cart_changed' and not tgisinternal) then
  create trigger kicks_cart_changed after insert or update or delete on public.cart_items
  for each row execute function public.notify_cart_change();
 end if;
end;
$$;
commit;

begin;
-- Demo fixtures only. Do not overwrite existing products, prices or stock.
insert into public.products(id,brand,name,color,category,description,image,price_kobo) values
('zip-suede-brown','Kicks Select','Zip Suede Low','Clay brown','Lifestyle','A brown suede pair with a centre zip and sculpted sole. Based on the supplied product reference.','zip-suede-brown',10500000),
('sculpted-orange','Kicks Select','Sculpted Slip-on','Orange / Forest','Sport style','Orange, yellow and forest-green panels form an expressive sculpted slip-on.','sculpted-orange',9500000),
('sculpted-lime','Kicks Select','Sculpted Slip-on','Lime / Espresso','Sport style','A lime-green sculpted silhouette with dark brown contrast panels.','sculpted-lime',9500000),
('dunk-pokemon-blue','Nike','Illustrated Court Low','Sky blue / White','Court','A blue and white low-top pair with illustrated details and a vivid blue outsole. Model name is descriptive pending seller confirmation.','dunk-pokemon-blue',9500000)
on conflict(id) do nothing;
insert into public.product_variants(product_id,size,stock)
select p.id,s,10 from public.products p cross join generate_series(39,45) as s
where p.id in ('zip-suede-brown','sculpted-orange','sculpted-lime','dunk-pokemon-blue')
on conflict(product_id,size) do nothing;
commit;
