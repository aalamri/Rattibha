-- Enables browser (Web Push) notifications for planners. The planner
-- dashboard is a web app, not a native app, so it can't use the
-- expo_push_token column customers use — a Web Push subscription is a
-- structured object (endpoint + encryption keys), not a single string
-- token, hence jsonb rather than text.
alter table profiles add column web_push_subscription jsonb;
