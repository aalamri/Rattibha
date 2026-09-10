-- RLS limits which rows can be written, not which columns. Keep the
-- existing profile/storefront APIs, but reserve privilege changes for
-- existing admins and trusted database/service-role operations.
-- SECURITY INVOKER is deliberate: current_user must remain the caller.
create or replace function public.protect_account_permissions()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if tg_table_name = 'profiles' then
    if tg_op = 'INSERT' then
      if new.is_admin then
        raise exception 'Only admins can grant administrator access' using errcode = '42501';
      end if;
    else
      if new.is_admin is distinct from old.is_admin
         or new.role is distinct from old.role
         or new.id is distinct from old.id then
        raise exception 'Only admins can change account permissions or ownership' using errcode = '42501';
      end if;
    end if;
  elsif tg_table_name = 'planners' then
    if tg_op = 'INSERT' then
      if new.verified then
        raise exception 'Only admins can verify planners' using errcode = '42501';
      end if;
    else
      if new.verified is distinct from old.verified
         or new.user_id is distinct from old.user_id then
        raise exception 'Only admins can change planner verification or ownership' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_account_permissions() from public;

create trigger profiles_protect_account_permissions
  before insert or update on public.profiles
  for each row execute function public.protect_account_permissions();

create trigger planners_protect_account_permissions
  before insert or update on public.planners
  for each row execute function public.protect_account_permissions();
