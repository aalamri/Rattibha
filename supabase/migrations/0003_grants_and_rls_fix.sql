-- Grant table-level privileges (RLS policies narrow rows, but Postgres also
-- requires the role to have privilege on the table itself), and fix infinite
-- RLS recursion caused by `requests` and `offers` policies each referencing
-- the other table directly.

-- ---------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;

-- ---------------------------------------------------------------------
-- Security-definer helpers (bypass RLS on the inner lookup so cross-table
-- policies don't recurse into each other).
-- ---------------------------------------------------------------------

create or replace function is_my_request(r_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from requests where id = r_id and customer_id = auth.uid());
$$;

create or replace function is_offer_on_my_request(r_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from offers where request_id = r_id and planner_id = auth.uid());
$$;

create or replace function is_offer_participant(o_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from offers
    join requests on requests.id = offers.request_id
    where offers.id = o_id
      and (offers.planner_id = auth.uid() or requests.customer_id = auth.uid())
  );
$$;

create or replace function is_contract_participant(c_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from contracts where id = c_id and is_offer_participant(contracts.offer_id)
  );
$$;

-- ---------------------------------------------------------------------
-- Rewrite the recursive policies
-- ---------------------------------------------------------------------

drop policy "requests_select_own_or_open" on requests;
create policy "requests_select_own_or_open" on requests
  for select using (
    customer_id = auth.uid()
    or status = 'open'
    or is_offer_on_my_request(id)
  );

drop policy "offers_select_participants" on offers;
create policy "offers_select_participants" on offers
  for select using (
    planner_id = auth.uid() or is_my_request(request_id)
  );

drop policy "offers_update_participants" on offers;
create policy "offers_update_participants" on offers
  for update using (
    planner_id = auth.uid() or is_my_request(request_id)
  );

drop policy "messages_select_participants" on messages;
create policy "messages_select_participants" on messages
  for select using (
    sender_id = auth.uid()
    or is_my_request(request_id)
    or is_offer_on_my_request(request_id)
  );

drop policy "messages_insert_participants" on messages;
create policy "messages_insert_participants" on messages
  for insert with check (
    sender_id = auth.uid()
    and (is_my_request(request_id) or is_offer_on_my_request(request_id))
  );

drop policy "contracts_select_participants" on contracts;
create policy "contracts_select_participants" on contracts
  for select using (is_offer_participant(offer_id));

drop policy "contracts_modify_participants" on contracts;
create policy "contracts_modify_participants" on contracts
  for update using (is_offer_participant(offer_id));

drop policy "payments_select_participants" on payments;
create policy "payments_select_participants" on payments
  for select using (is_contract_participant(contract_id));

drop policy "bookings_select_participants" on bookings;
create policy "bookings_select_participants" on bookings
  for select using (is_contract_participant(contract_id));

drop policy "bookings_update_participants" on bookings;
create policy "bookings_update_participants" on bookings
  for update using (is_contract_participant(contract_id));
