-- Add Expo push token column to profiles so the server can send
-- push notifications to specific devices.
alter table profiles
  add column if not exists expo_push_token text;
