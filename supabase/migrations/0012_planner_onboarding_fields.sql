-- Fields collected by the planner onboarding wizard that don't map to an
-- existing column: team size / years in business (free-text bands shown as
-- chips), typical budget tier, starting package price, and the CR number
-- used during business verification.

alter table planners
  add column years_in_business text,
  add column team_size text,
  add column budget_tier text,
  add column starting_price numeric,
  add column cr_number text;
