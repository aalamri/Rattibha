-- Super-user admin: an additive flag on profiles rather than a new
-- user_role enum value, so a planner or customer can also be an admin
-- without losing/ambiguously reverting their primary role on demotion.

alter table profiles add column is_admin boolean not null default false;

-- security definer + pinned search_path so this can be safely referenced
-- from RLS policies without exposing a privilege-escalation path.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$$;

grant execute on function is_admin() to authenticated;

-- profiles: admins can see and update any profile (needed to find and
-- promote/demote other users on the admin users page).
create policy "profiles_select_admin" on profiles
  for select using (is_admin());

create policy "profiles_update_admin" on profiles
  for update using (is_admin());

-- planners: admins can update any planner row (approve/reject verification).
create policy "planners_modify_admin" on planners
  for update using (is_admin()) with check (is_admin());

-- profiles has no email column (email lives in auth.users, which isn't
-- exposed to the API), so searching users by email for the admin page
-- needs a security definer function that joins it in, gated by is_admin()
-- inside the function itself rather than relying on table-level RLS.
create or replace function admin_list_users(search text default '')
returns table (
  id uuid,
  email text,
  full_name text,
  role user_role,
  is_admin boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select p.id, u.email::text, p.full_name, p.role, p.is_admin, p.created_at
    from profiles p
    join auth.users u on u.id = p.id
    where search = '' or u.email ilike '%' || search || '%' or p.full_name ilike '%' || search || '%'
    order by p.created_at desc
    limit 50;
end;
$$;

grant execute on function admin_list_users(text) to authenticated;
