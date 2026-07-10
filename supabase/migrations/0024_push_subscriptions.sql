-- Moves push delivery credentials (expo_push_token, web_push_subscription)
-- off profiles into their own table with owner-only RLS.
--
-- profiles rows are broadly readable — profiles_select_own_or_planner
-- (0004) grants SELECT to any authenticated user for planner rows (needed
-- for legitimate reads like storefront avatars/business names) and to a
-- planner's own customers via is_my_customer. RLS is row-level, not
-- column-level, so that policy was also exposing these two push-delivery
-- secrets to anyone who could read the row, not just its owner. Splitting
-- them into their own table lets that table have a strictly owner-only
-- policy without touching profiles' existing (correct, needed) visibility
-- for everything else.
--
-- send-push (using the service_role key, which bypasses RLS) can still
-- read across all users exactly as before — this only tightens what an
-- authenticated client can see of another user's row.

create table push_subscriptions (
  user_id uuid primary key references profiles (id) on delete cascade,
  expo_push_token text,
  web_push_subscription jsonb
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on push_subscriptions
  for select using (user_id = auth.uid());

create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check (user_id = auth.uid());

create policy "push_subscriptions_update_own" on push_subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Backfill any existing tokens/subscriptions before dropping the columns.
insert into push_subscriptions (user_id, expo_push_token, web_push_subscription)
select id, expo_push_token, web_push_subscription
from profiles
where expo_push_token is not null or web_push_subscription is not null;

alter table profiles drop column expo_push_token;
alter table profiles drop column web_push_subscription;
