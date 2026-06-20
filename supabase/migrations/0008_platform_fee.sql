-- Add platform_fee to bookings so the take-rate is recorded at the time
-- of booking creation rather than computed ad-hoc in the UI.
-- Rate: 15% of the total offer price (per CLAUDE.md spec).
alter table bookings
  add column if not exists platform_fee numeric(10, 2) not null default 0;
