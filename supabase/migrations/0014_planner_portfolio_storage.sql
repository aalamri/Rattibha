-- Storage for planner portfolio photos, uploaded during onboarding's
-- "Show your best work" step. No Storage bucket existed anywhere in this
-- project before this — public read (storefronts display these), writes
-- restricted to the owning planner via the `{user_id}/...` path prefix.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('planner-portfolios', 'planner-portfolios', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "planner_portfolios_select_all" on storage.objects
  for select using (bucket_id = 'planner-portfolios');

create policy "planner_portfolios_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'planner-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "planner_portfolios_modify_own" on storage.objects
  for update using (
    bucket_id = 'planner-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "planner_portfolios_delete_own" on storage.objects
  for delete using (
    bucket_id = 'planner-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

alter table planners add column portfolio_urls text[] not null default '{}';
