-- contracts/payments/bookings had select+update policies but no insert
-- policy, so the planner-side countersign flow (which lazily creates these
-- rows) was silently rejected by RLS.

create policy "contracts_insert_participants" on contracts
  for insert with check (is_offer_participant(offer_id));

create policy "payments_insert_participants" on payments
  for insert with check (is_contract_participant(contract_id));

create policy "bookings_insert_participants" on bookings
  for insert with check (is_contract_participant(contract_id));
