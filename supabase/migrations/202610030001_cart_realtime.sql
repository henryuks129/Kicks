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
