-- Allow a planner to view the profile of a customer whose request they have
-- submitted an offer on (needed to show client name/avatar on Open Requests,
-- My Offers, Deal, and Bookings pages).

create or replace function is_my_customer(p_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from requests
    where requests.customer_id = p_id
      and is_offer_on_my_request(requests.id)
  );
$$;

drop policy if exists "profiles_select_own_or_planner" on profiles;

create policy "profiles_select_own_or_planner" on profiles
  for select using (
    id = auth.uid()
    or id in (select user_id from planners)
    or is_my_customer(id)
  );
