-- Push notification triggers via pg_net.
-- Each trigger POSTs to the send-push Edge Function when a key event occurs.
-- The Edge Function looks up the recipient's expo_push_token and dispatches
-- the notification through the Expo Push API.
--
-- Requires: pg_net extension (enabled by default on Supabase hosted projects).
-- Replace <PROJECT_REF> with your actual Supabase project ref before deploying.

create extension if not exists pg_net;

-- Holds the push-trigger helper functions. Not listed in api.schemas, so
-- none of this is exposed over PostgREST — it only needs to exist for the
-- `create function private.*` statements below to succeed.
create schema if not exists private;

-- ── Helper: fire-and-forget POST to the Edge Function ────────────────────────
-- We wrap net.http_post in a helper to keep trigger bodies short.

create or replace function private.notify_push(payload jsonb)
returns void
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url     => current_setting('app.supabase_url', true) || '/functions/v1/send-push',
    headers => jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    => payload::text
  );
exception when others then
  -- Never let a push failure break the originating transaction — this also
  -- covers app.supabase_url/app.service_role_key being unset (e.g. local dev
  -- without the GUCs configured via ALTER DATABASE ... SET).
  null;
end;
$$;

-- ── 1. New offer received → notify customer ───────────────────────────────────

create or replace function private.on_offer_insert()
returns trigger language plpgsql security definer as $$
begin
  perform private.notify_push(
    jsonb_build_object('event', 'new_offer', 'offer_id', new.id)
  );
  return new;
end;
$$;

create trigger push_on_offer_insert
  after insert on public.offers
  for each row execute function private.on_offer_insert();

-- ── 2. New message → notify recipient ────────────────────────────────────────

create or replace function private.on_message_insert()
returns trigger language plpgsql security definer as $$
begin
  perform private.notify_push(
    jsonb_build_object('event', 'new_message', 'message_id', new.id)
  );
  return new;
end;
$$;

create trigger push_on_message_insert
  after insert on public.messages
  for each row execute function private.on_message_insert();

-- ── 3. Planner countersigns → notify customer they can pay ───────────────────

create or replace function private.on_offer_countersigned()
returns trigger language plpgsql security definer as $$
begin
  if new.deal_status = 'countersigned' and old.deal_status is distinct from 'countersigned' then
    perform private.notify_push(
      jsonb_build_object('event', 'countersigned', 'offer_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger push_on_offer_countersigned
  after update on public.offers
  for each row execute function private.on_offer_countersigned();

-- ── 4. Booking created → notify customer booking is confirmed ─────────────────

create or replace function private.on_booking_insert()
returns trigger language plpgsql security definer as $$
begin
  perform private.notify_push(
    jsonb_build_object('event', 'booking_confirmed', 'booking_id', new.id)
  );
  return new;
end;
$$;

create trigger push_on_booking_insert
  after insert on public.bookings
  for each row execute function private.on_booking_insert();
