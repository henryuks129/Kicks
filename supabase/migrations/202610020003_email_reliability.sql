begin;
alter table public.email_events
 add column if not exists next_attempt_at timestamptz not null default now(),
 add column if not exists claimed_at timestamptz,
 add column if not exists submitted_at timestamptz,
 add column if not exists provider_message_id text,
 add column if not exists delivery_status text not null default 'unknown',
 add column if not exists delivery_checked_at timestamptz;
alter table public.email_events drop constraint if exists email_events_delivery_status_check;
alter table public.email_events add constraint email_events_delivery_status_check
 check(delivery_status in ('unknown','queued','sent','delivered','rejected','paused','uncertain'));
create unique index if not exists email_events_provider_message on public.email_events(provider_message_id) where provider_message_id is not null;
create index if not exists email_events_retry_due on public.email_events(next_attempt_at,created_at) where status in ('pending','failed');
-- Historical submissions have no stored provider ID and must not be resent automatically.
update public.email_events set delivery_status='uncertain' where status='sending' and provider_message_id is null and claimed_at is null;
commit;
