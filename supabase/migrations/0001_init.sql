-- Ratibha core schema: profiles, planners, requests, offers, contracts,
-- payments, bookings, reviews, messages, notifications + the shared deal
-- state machine (request -> offer_sent -> accepted -> countersigned ->
-- deposit_paid -> completed -> reviewed).

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type user_role as enum ('customer', 'planner');
create type app_language as enum ('en', 'ar');

create type city_key as enum (
  'riyadh', 'jeddah', 'makkah', 'madinah', 'dammam', 'khobar', 'dhahran',
  'taif', 'tabuk', 'abha', 'al_ahsa', 'buraidah', 'yanbu'
);

create type event_category as enum (
  'weddings', 'birthdays', 'engagements', 'corporate', 'galas'
);

create type budget_range as enum ('under10', '10to20', '20to35', 'over35');

create type package_tier as enum ('essentials', 'signature', 'luxury');

create type request_status as enum ('open', 'matched', 'closed', 'cancelled');

create type offer_status as enum (
  'pending', 'viewed', 'accepted', 'declined', 'withdrawn'
);

-- The shared deal lifecycle. 'request' is the implicit starting point
-- before any offer exists; every offer row is created at 'offer_sent'.
create type deal_status as enum (
  'request',
  'offer_sent',
  'accepted',
  'countersigned',
  'deposit_paid',
  'completed',
  'reviewed',
  'declined',
  'cancelled'
);

create type payment_type as enum ('deposit', 'balance');
create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');

create type booking_stage as enum (
  'planning', 'design', 'awaiting_deposit', 'final_walkthrough', 'completed'
);

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  full_name text not null,
  phone text unique,
  language app_language not null default 'ar',
  city city_key,
  avatar_seed int not null default 0,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ---------------------------------------------------------------------
-- Planners (1:1 with profiles where role = 'planner')
-- ---------------------------------------------------------------------

create table planners (
  user_id uuid primary key references profiles (id) on delete cascade,
  business_name text not null,
  bio text,
  city city_key not null,
  categories event_category[] not null default '{}',
  verified boolean not null default false,
  tier text not null default 'standard',
  rating numeric(3, 2) not null default 0,
  reviews_count int not null default 0,
  instagram text,
  website text,
  created_at timestamptz not null default now()
);

create index planners_city_idx on planners (city);
create index planners_categories_idx on planners using gin (categories);

-- ---------------------------------------------------------------------
-- Planner services (storefront line items / packages)
-- ---------------------------------------------------------------------

create table planner_services (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references planners (user_id) on delete cascade,
  name text not null,
  description text,
  from_price numeric(10, 2) not null,
  seed int not null default 0,
  created_at timestamptz not null default now()
);

create index planner_services_planner_idx on planner_services (planner_id);

-- ---------------------------------------------------------------------
-- Requests (customer briefs)
-- ---------------------------------------------------------------------

create table requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id) on delete cascade,
  category event_category not null,
  city city_key not null,
  event_date date not null,
  guests int not null check (guests > 0),
  budget budget_range not null,
  note text,
  status request_status not null default 'open',
  created_at timestamptz not null default now()
);

create index requests_city_category_idx on requests (city, category);
create index requests_customer_idx on requests (customer_id);
create index requests_status_idx on requests (status);

-- ---------------------------------------------------------------------
-- Offers (planner quotes against a request) + deal lifecycle
-- ---------------------------------------------------------------------

create table offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  planner_id uuid not null references planners (user_id) on delete cascade,
  package package_tier not null,
  price numeric(10, 2) not null check (price > 0),
  message text,
  status offer_status not null default 'pending',
  deal_status deal_status not null default 'offer_sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, planner_id)
);

create index offers_request_idx on offers (request_id);
create index offers_planner_idx on offers (planner_id);
create index offers_deal_status_idx on offers (deal_status);

-- Enforce the shared deal state machine on offers.deal_status.
create or replace function check_deal_transition()
returns trigger
language plpgsql
as $$
declare
  allowed boolean;
begin
  if tg_op = 'INSERT' then
    if new.deal_status not in ('offer_sent', 'declined', 'cancelled') then
      raise exception 'Deals must start at offer_sent (got %)', new.deal_status;
    end if;
    return new;
  end if;

  if new.deal_status = old.deal_status then
    return new;
  end if;

  allowed := (old.deal_status, new.deal_status) in (
    ('offer_sent', 'accepted'),
    ('offer_sent', 'declined'),
    ('offer_sent', 'cancelled'),
    ('accepted', 'countersigned'),
    ('accepted', 'cancelled'),
    ('countersigned', 'deposit_paid'),
    ('countersigned', 'cancelled'),
    ('deposit_paid', 'completed'),
    ('completed', 'reviewed')
  );

  if not allowed then
    raise exception 'Invalid deal transition: % -> %', old.deal_status, new.deal_status;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger offers_deal_transition
  before insert or update on offers
  for each row execute function check_deal_transition();

-- ---------------------------------------------------------------------
-- Contracts (signed agreement per accepted offer)
-- ---------------------------------------------------------------------

create table contracts (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references offers (id) on delete cascade,
  ref text not null,
  signed_by_customer_at timestamptz,
  signed_by_planner_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Payments (deposit / balance against a contract)
-- ---------------------------------------------------------------------

create table payments (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts (id) on delete cascade,
  type payment_type not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_contract_idx on payments (contract_id);

-- ---------------------------------------------------------------------
-- Bookings (confirmed event, tracked post-countersign)
-- ---------------------------------------------------------------------

create table bookings (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null unique references contracts (id) on delete cascade,
  stage booking_stage not null default 'planning',
  event_date date not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Reviews (one per completed booking)
-- ---------------------------------------------------------------------

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings (id) on delete cascade,
  customer_id uuid not null references profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Messages (per-request thread between customer and planner)
-- ---------------------------------------------------------------------

create table messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_request_idx on messages (request_id, created_at);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications (user_id, read);

-- ---------------------------------------------------------------------
-- Reviewed -> roll up rating onto the planner
-- ---------------------------------------------------------------------

create or replace function apply_review_to_planner()
returns trigger
language plpgsql
as $$
declare
  v_planner_id uuid;
begin
  select o.planner_id into v_planner_id
  from bookings b
  join contracts c on c.id = b.contract_id
  join offers o on o.id = c.offer_id
  where b.id = new.booking_id;

  update planners
  set
    reviews_count = reviews_count + 1,
    rating = round(
      ((rating * reviews_count) + new.rating)::numeric / (reviews_count + 1), 2
    )
  where user_id = v_planner_id;

  update offers set deal_status = 'reviewed' where id = (
    select c.offer_id from bookings b join contracts c on c.id = b.contract_id
    where b.id = new.booking_id
  );

  return new;
end;
$$;

create trigger reviews_apply_to_planner
  after insert on reviews
  for each row execute function apply_review_to_planner();
