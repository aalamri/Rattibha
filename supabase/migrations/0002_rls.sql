-- Row-level security: customers manage their own requests/deals, planners
-- manage their storefront + the deals attached to their offers. Storefront
-- data (planners, services) is publicly readable for browsing.

alter table profiles enable row level security;
alter table planners enable row level security;
alter table planner_services enable row level security;
alter table requests enable row level security;
alter table offers enable row level security;
alter table contracts enable row level security;
alter table payments enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

create policy "profiles_select_own_or_planner" on profiles
  for select using (
    id = auth.uid() or id in (select user_id from planners)
  );

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- planners + planner_services (public storefronts)
-- ---------------------------------------------------------------------

create policy "planners_select_all" on planners
  for select using (true);

create policy "planners_modify_own" on planners
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "planner_services_select_all" on planner_services
  for select using (true);

create policy "planner_services_modify_own" on planner_services
  for all using (
    planner_id = auth.uid()
  ) with check (
    planner_id = auth.uid()
  );

-- ---------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------

create policy "requests_select_own_or_open" on requests
  for select using (
    customer_id = auth.uid()
    or status = 'open'
    or exists (
      select 1 from offers
      where offers.request_id = requests.id and offers.planner_id = auth.uid()
    )
  );

create policy "requests_insert_own" on requests
  for insert with check (customer_id = auth.uid());

create policy "requests_update_own" on requests
  for update using (customer_id = auth.uid());

-- ---------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------

create policy "offers_select_participants" on offers
  for select using (
    planner_id = auth.uid()
    or exists (
      select 1 from requests
      where requests.id = offers.request_id and requests.customer_id = auth.uid()
    )
  );

create policy "offers_insert_planner" on offers
  for insert with check (planner_id = auth.uid());

create policy "offers_update_participants" on offers
  for update using (
    planner_id = auth.uid()
    or exists (
      select 1 from requests
      where requests.id = offers.request_id and requests.customer_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- contracts / payments / bookings / reviews (via offers -> requests)
-- ---------------------------------------------------------------------

create policy "contracts_select_participants" on contracts
  for select using (
    exists (
      select 1 from offers
      join requests on requests.id = offers.request_id
      where offers.id = contracts.offer_id
        and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
    )
  );

create policy "contracts_modify_participants" on contracts
  for update using (
    exists (
      select 1 from offers
      join requests on requests.id = offers.request_id
      where offers.id = contracts.offer_id
        and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
    )
  );

create policy "payments_select_participants" on payments
  for select using (
    exists (
      select 1 from contracts
      join offers on offers.id = contracts.offer_id
      join requests on requests.id = offers.request_id
      where contracts.id = payments.contract_id
        and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
    )
  );

create policy "bookings_select_participants" on bookings
  for select using (
    exists (
      select 1 from contracts
      join offers on offers.id = contracts.offer_id
      join requests on requests.id = offers.request_id
      where contracts.id = bookings.contract_id
        and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
    )
  );

create policy "bookings_update_participants" on bookings
  for update using (
    exists (
      select 1 from contracts
      join offers on offers.id = contracts.offer_id
      join requests on requests.id = offers.request_id
      where contracts.id = bookings.contract_id
        and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
    )
  );

create policy "reviews_select_all" on reviews
  for select using (true);

create policy "reviews_insert_own" on reviews
  for insert with check (customer_id = auth.uid());

-- ---------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------

create policy "messages_select_participants" on messages
  for select using (
    sender_id = auth.uid()
    or exists (
      select 1 from requests
      where requests.id = messages.request_id and requests.customer_id = auth.uid()
    )
    or exists (
      select 1 from offers
      where offers.request_id = messages.request_id and offers.planner_id = auth.uid()
    )
  );

create policy "messages_insert_participants" on messages
  for insert with check (
    sender_id = auth.uid()
    and (
      exists (
        select 1 from requests
        where requests.id = messages.request_id and requests.customer_id = auth.uid()
      )
      or exists (
        select 1 from offers
        where offers.request_id = messages.request_id and offers.planner_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------

create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid());
