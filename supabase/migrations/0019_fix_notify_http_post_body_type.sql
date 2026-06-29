-- The real bug behind 0018: net.http_post's `body` parameter is `jsonb`,
-- not `text`. Both notify_push and notify_email called it with
-- `body => payload::text` — an explicit cast to text, which Postgres
-- won't silently re-coerce back to jsonb, so every call failed with
-- "function net.http_post(...) does not exist" and got swallowed by the
-- `exception when others then null` handler. Confirmed by reproducing
-- with a debug function that didn't swallow the error.
--
-- (0018's search_path fix was still necessary and correct — net/vault need
-- to be in the path — this fixes the actual call signature on top of it.)

create or replace function private.notify_push(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, net, vault, pg_temp
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
    body    => payload
  );
exception when others then
  null;
end;
$$;

create or replace function private.notify_email(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, net, vault, pg_temp
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
    body    => payload
  );
exception when others then
  null;
end;
$$;
