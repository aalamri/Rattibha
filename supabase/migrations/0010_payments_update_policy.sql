-- payments had select+insert policies but no update policy, so the customer's
-- checkout flow couldn't mark the planner's pre-created pending deposit/balance
-- rows as paid — it had to insert a duplicate row instead (see checkout.tsx).

create policy "payments_update_participants" on payments
  for update using (is_contract_participant(contract_id));
