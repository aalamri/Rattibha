-- Planner-managed blocked dates (vacations, site visits, personal events)
-- shown alongside real bookings on the planner Calendar view. Distinct
-- from `bookings`, which only ever come from a countersigned deal.

create table planner_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references planners (user_id) on delete cascade,
  date date not null,
  label text,
  created_at timestamptz not null default now()
);

create index planner_blocked_dates_planner_idx on planner_blocked_dates (planner_id, date);

alter table planner_blocked_dates enable row level security;

create policy "planner_blocked_dates_select_own" on planner_blocked_dates
  for select using (planner_id = auth.uid());

create policy "planner_blocked_dates_insert_own" on planner_blocked_dates
  for insert with check (planner_id = auth.uid());

create policy "planner_blocked_dates_delete_own" on planner_blocked_dates
  for delete using (planner_id = auth.uid());

grant select, insert, delete on planner_blocked_dates to authenticated;
