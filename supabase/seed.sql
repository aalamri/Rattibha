-- Local dev seed data. Mirrors the mock data used in apps/planner
-- (PLANNER, MY_OFFERS, OPEN_REQUESTS) so the real backend can replace those
-- mocks 1:1. All seed accounts use the password 'password123'.

-- ---------------------------------------------------------------------
-- auth.users (1 planner + 8 customers)
-- ---------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'planner@lumiere-events.sa', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'noura.alqahtani@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'events@faisalgroup.example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sara.hassan@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'mona.khalid@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'mansour.k@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'latifa.s@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'hessa.m@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'abeer.t@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

insert into profiles (id, role, full_name, phone, language, city, avatar_seed) values
  ('11111111-0000-0000-0000-000000000001', 'planner', 'Lumière Events', '+966500000001', 'en', 'riyadh', 0),
  ('22222222-0000-0000-0000-000000000001', 'customer', 'Noura Al-Qahtani', '+966500000011', 'ar', 'riyadh', 1),
  ('22222222-0000-0000-0000-000000000002', 'customer', 'Faisal Group', '+966500000012', 'en', 'riyadh', 2),
  ('22222222-0000-0000-0000-000000000003', 'customer', 'Sara Hassan', '+966500000013', 'ar', 'jeddah', 4),
  ('22222222-0000-0000-0000-000000000004', 'customer', 'Mona Khalid', '+966500000014', 'ar', 'riyadh', 5),
  ('22222222-0000-0000-0000-000000000005', 'customer', 'Mansour K.', '+966500000015', 'ar', 'riyadh', 2),
  ('22222222-0000-0000-0000-000000000006', 'customer', 'Latifa S.', '+966500000016', 'ar', 'jeddah', 4),
  ('22222222-0000-0000-0000-000000000007', 'customer', 'Hessa M.', '+966500000017', 'ar', 'riyadh', 3),
  ('22222222-0000-0000-0000-000000000008', 'customer', 'Abeer T.', '+966500000018', 'ar', 'jeddah', 5);

-- ---------------------------------------------------------------------
-- planners + planner_services
-- ---------------------------------------------------------------------

insert into planners (user_id, business_name, bio, city, categories, verified, tier, rating, reviews_count, instagram, website) values
  (
    '11111111-0000-0000-0000-000000000001',
    'Lumière Events',
    'Award-winning luxury wedding & gala studio crafting unforgettable celebrations across the Kingdom.',
    'riyadh',
    array['weddings', 'galas']::event_category[],
    true,
    'Premium',
    4.9,
    168,
    '@lumiere.events',
    'https://lumiere-events.example.com'
  );

insert into planner_services (planner_id, name, description, from_price, seed) values
  ('11111111-0000-0000-0000-000000000001', 'Full Wedding Planning', 'End-to-end planning, styling & coordination.', 18000, 0),
  ('11111111-0000-0000-0000-000000000001', 'Luxury Gala Production', 'Stage, lighting, AV & show production.', 42000, 5),
  ('11111111-0000-0000-0000-000000000001', 'Engagement & Milkah', 'Intimate styling, florals & catering.', 12000, 3);

-- ---------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------

-- Requests with an offer from Lumière Events (matches MY_OFFERS l1-l4)
insert into requests (id, customer_id, category, city, event_date, guests, budget, note, status) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'weddings', 'riyadh', current_date + interval '14 days', 220, '20to35', 'Looking for an elegant garden wedding in soft rose & gold. Full planning + décor.', 'matched'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'corporate', 'riyadh', current_date + interval '60 days', 400, 'over35', 'Annual celebration & awards night for 400 staff. Stage, AV and catering.', 'matched'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'engagements', 'jeddah', current_date + interval '35 days', 120, '10to20', 'Intimate engagement, modern romantic styling.', 'matched'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'birthdays', 'riyadh', current_date + interval '27 days', 60, 'under10', E'Daughter''s 7th birthday — princess theme, balloons & cake.', 'matched');

-- Open requests (no offer yet — visible on the Open Requests board)
insert into requests (id, customer_id, category, city, event_date, guests, budget, note, status) values
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', 'corporate', 'riyadh', current_date + interval '60 days', 300, 'over35', 'Annual company gala — stage production, AV, catering and awards ceremony for 300.', 'open'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000006', 'engagements', 'jeddah', current_date + interval '35 days', 80, '10to20', 'Intimate engagement dinner with romantic styling and a live florals setup.', 'open'),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000007', 'galas', 'riyadh', current_date + interval '90 days', 200, '20to35', 'Charity gala dinner — elegant ballroom styling, entertainment and full coordination.', 'open'),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000008', 'weddings', 'jeddah', current_date + interval '33 days', 250, '20to35', 'Red Sea waterfront wedding — modern styling, florals and premium catering.', 'open');

-- ---------------------------------------------------------------------
-- offers (deal lifecycle samples: pending, viewed, accepted, declined)
-- ---------------------------------------------------------------------

insert into offers (id, request_id, planner_id, package, price, message, status, deal_status) values
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'signature', 22000, 'We''d love to bring your wedding to life with our Signature package.', 'pending', 'offer_sent'),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'luxury', 46000, 'A full production package for your awards night.', 'viewed', 'offer_sent'),
  ('44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'essentials', 13500, 'Intimate, modern romantic styling for your engagement.', 'accepted', 'offer_sent'),
  ('44444444-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'essentials', 6800, 'Princess-themed birthday package, balloons & cake included.', 'declined', 'offer_sent');

-- Advance the lifecycle on the accepted/declined deals (insert must start
-- at offer_sent; transitions happen via update so the trigger validates them).
update offers set deal_status = 'accepted' where id = '44444444-0000-0000-0000-000000000003';
update offers set deal_status = 'declined' where id = '44444444-0000-0000-0000-000000000004';

-- ---------------------------------------------------------------------
-- contract + payments + booking for the accepted deal (l3, awaiting countersign)
-- ---------------------------------------------------------------------

insert into contracts (id, offer_id, ref, signed_by_customer_at) values
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', 'RTB-2026-0314', now());

insert into payments (contract_id, type, amount, status) values
  ('55555555-0000-0000-0000-000000000001', 'deposit', 2700, 'pending'),
  ('55555555-0000-0000-0000-000000000001', 'balance', 10800, 'pending');

-- ---------------------------------------------------------------------
-- messages (sample thread on the wedding request — Planner Messages view)
-- ---------------------------------------------------------------------

insert into messages (request_id, planner_id, sender_id, body, created_at) values
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'مرحبًا! تسلمت عرضكم — يبدو رائعًا 💜', now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'So glad you like it! The Signature package will suit your 220 guests perfectly.', now() - interval '1 day' + interval '15 minutes'),
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'هل يمكن أن تكون الزهور بألوان وردي وذهبي فاتح؟', now() - interval '20 hours'),
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Absolutely — that''s one of our signature palettes. I''ll send a moodboard today.', now() - interval '19 hours');
