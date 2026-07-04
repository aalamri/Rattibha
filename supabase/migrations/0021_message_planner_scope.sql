-- messages had no planner-scoping column — only request_id. A single
-- request can receive offers from multiple planners (unique constraint on
-- offers(request_id, planner_id) confirms one offer per planner per
-- request), so the existing RLS policies granted SELECT/INSERT to *any*
-- planner with an offer on the request, letting them read each other's
-- private conversations with the customer. The customer's conversation
-- list also picked one arbitrary planner to represent a thread that could
-- contain messages from several different planners.
--
-- Adds messages.planner_id, backfills it, then re-scopes RLS to the
-- specific planner on each row instead of "any planner on this request".

alter table messages add column planner_id uuid references planners (user_id) on delete cascade;

-- Backfill: every existing request currently has exactly one planner with
-- an offer (verified against this data before writing this migration), so
-- the mapping is unambiguous. If that's no longer true when this runs
-- elsewhere, the NOT NULL check below will fail loudly instead of
-- silently picking an arbitrary planner for an ambiguous thread.
update messages m
set planner_id = o.planner_id
from offers o
where o.request_id = m.request_id
  and m.planner_id is null;

do $$
declare
  v_null_count int;
begin
  select count(*) into v_null_count from messages where planner_id is null;
  if v_null_count > 0 then
    raise exception 'messages.planner_id backfill left % row(s) null — a request has messages but no matching offer, resolve manually before this migration can proceed', v_null_count;
  end if;
end $$;

alter table messages alter column planner_id set not null;

create index messages_planner_idx on messages (request_id, planner_id, created_at);

drop policy if exists "messages_select_participants" on messages;
create policy "messages_select_participants" on messages
  for select using (
    sender_id = auth.uid()
    or exists (
      select 1 from requests
      where requests.id = messages.request_id and requests.customer_id = auth.uid()
    )
    or messages.planner_id = auth.uid()
  );

drop policy if exists "messages_insert_participants" on messages;
create policy "messages_insert_participants" on messages
  for insert with check (
    sender_id = auth.uid()
    and (
      exists (
        select 1 from requests
        where requests.id = messages.request_id and requests.customer_id = auth.uid()
      )
      or messages.planner_id = auth.uid()
    )
    and exists (
      select 1 from offers
      where offers.request_id = messages.request_id
        and offers.planner_id = messages.planner_id
    )
  );

-- notify_planner_new_message (0013_planner_notifications.sql) notified
-- *every* planner with an offer on the request, not just the one the
-- message thread actually belongs to — now that messages.planner_id names
-- the specific planner directly, over-notifying uninvolved planners about
-- a thread they can no longer even read (per the RLS change above) would
-- be a confusing dead end. Re-scope it to that one planner.
create or replace function notify_planner_new_message()
returns trigger language plpgsql security definer as $$
begin
  if new.planner_id != new.sender_id then
    insert into notifications (user_id, type, payload)
    values (new.planner_id, 'new_message', jsonb_build_object(
      'request_id', new.request_id,
      'message_id', new.id,
      'preview', substring(new.body from 1 for 80)
    ));
  end if;
  return new;
end;
$$;

-- notify_customer_new_message (0020_customer_notifications.sql) inferred
-- "which planner sent this" from sender_id, which only worked because a
-- planner always sends as themselves. messages.planner_id is now the
-- authoritative column for that — use it directly instead of the
-- sender_id proxy.
create or replace function notify_customer_new_message()
returns trigger language plpgsql security definer as $$
begin
  insert into notifications (user_id, type, payload)
  select r.customer_id, 'message', jsonb_build_object(
    'request_id', new.request_id,
    'message_id', new.id,
    'planner_id', new.planner_id,
    'planner_name', p.business_name,
    'planner_seed', pr.avatar_seed,
    'preview', substring(new.body from 1 for 80)
  )
  from requests r
  left join planners p on p.user_id = new.planner_id
  left join profiles pr on pr.id = new.planner_id
  where r.id = new.request_id
    and r.customer_id != new.sender_id;
  return new;
end;
$$;
