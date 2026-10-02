begin;
alter table public.email_events drop constraint if exists email_events_kind_check;
alter table public.email_events add constraint email_events_kind_check check(kind in ('welcome','signin','receipt'));
commit;
