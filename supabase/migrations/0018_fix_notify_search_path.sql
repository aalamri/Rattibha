-- private.notify_push/notify_email set search_path = public, pg_temp, which
-- excludes net and vault from the path. Schema-qualifying the entry-point
-- calls (net.http_post, vault.decrypted_secrets) isn't enough: those
-- extensions' own internals can call their own helpers unqualified,
-- relying on the caller's search_path including their schema — without it,
-- the call fails and the surrounding `exception when others then null`
-- silently swallows it. Confirmed by reproducing the exact same logic in a
-- plain DO block with no search_path override, which worked.

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
    body    => payload::text
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
    body    => payload::text
  );
exception when others then
  null;
end;
$$;
