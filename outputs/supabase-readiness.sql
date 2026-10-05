-- Paste into Supabase SQL Editor first. Read-only; shows no customer data.
select name, to_regclass('public.' || name) is not null as present
from (values ('products'),('product_variants'),('profiles'),('cart_items'),('orders'),('payments'),('order_items'),('email_events')) as required(name);
select 'cart_notify_function' as feature, to_regprocedure('public.notify_cart_change()') is not null as present
union all select 'cart_owner_broadcast_policy', exists(select 1 from pg_policies where schemaname='realtime' and tablename='messages' and policyname='kicks_receive_own_cart')
union all select 'cart_change_trigger', exists(select 1 from pg_trigger where tgrelid=to_regclass('public.cart_items') and tgname='kicks_cart_changed' and not tgisinternal);
-- After products/variants are present, run this separately to check new fixtures:
-- select p.id, count(v.id) as sizes from public.products p
-- left join public.product_variants v on v.product_id=p.id
-- where p.id in ('zip-suede-brown','sculpted-orange','sculpted-lime','dunk-pokemon-blue')
-- group by p.id order by p.id;
-- Expect four product rows, seven EU sizes each on a freshly seeded catalogue.
