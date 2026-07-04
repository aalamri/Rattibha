-- Registers the tables the app subscribes to via supabase-js postgres_changes
-- with the realtime publication. Without this, INSERT/UPDATE events are never
-- broadcast to any client, regardless of channel filters — every
-- `.on('postgres_changes', ...)` subscription in apps/customer and
-- apps/planner has been silently inert.
alter publication supabase_realtime add table public.requests, public.offers, public.messages, public.notifications;
