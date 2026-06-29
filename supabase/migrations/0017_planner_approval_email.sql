-- Fixes private.notify_push, which has been silently no-op-ing in production
-- since 0007: it read app.supabase_url / app.service_role_key via
-- current_setting(), but `alter database ... set app.*` requires a
-- permission level Supabase's hosted Postgres doesn't grant. Vault
-- (already enabled) is the supported way to store these for use inside
-- trigger functions — see supabase.com/docs/guides/database/vault.
--
-- Also adds the planner-approval email notification, mirroring the same
-- pg_net -> Edge Function pattern as the push notifications.

create or replace function private.notify_push(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'supabase_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    return;
  end if;

  perform net.http_post(
    url     => v_url || '/functions/v1/send-push',
    headers => jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
    body    => payload::text
  );
exception when others then
  -- Never let a notification failure break the originating transaction.
  null;
end;
$$;

create or replace function private.notify_email(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'supabase_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    return;
  end if;

  perform net.http_post(
    url     => v_url || '/functions/v1/send-email',
    headers => jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
    body    => payload::text
  );
exception when others then
  null;
end;
$$;

-- Planner approved (verified flips false/null -> true) -> email the planner.
create or replace function private.on_planner_verified()
returns trigger language plpgsql security definer as $$
begin
  if new.verified = true and coalesce(old.verified, false) = false then
    perform private.notify_email(
      jsonb_build_object('event', 'planner_approved', 'planner_id', new.user_id)
    );
  end if;
  return new;
end;
$$;

create trigger email_on_planner_verified
  after update on public.planners
  for each row execute function private.on_planner_verified();
