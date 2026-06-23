-- Real photo per service/package, alongside the existing seed-based gradient
-- fallback (kept for services that haven't uploaded one). Uses the same
-- planner-portfolios bucket and {user_id}/... RLS path prefix added in
-- 0014_planner_portfolio_storage.sql — services are stored under a
-- {user_id}/services/ sub-path.

alter table planner_services add column image_url text;
