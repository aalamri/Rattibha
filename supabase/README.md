# Ratibha backend (Supabase)

Local Postgres + Auth + Storage backing both `apps/planner` and `apps/customer`.

## Setup

Requires Docker (this machine uses [colima](https://github.com/abiosoft/colima) —
run `colima start` first if `docker info` fails).

```bash
npx supabase start   # first run pulls images, ~2-3 min
npx supabase status  # prints API URL + anon/service-role keys
npx supabase stop    # when done
```

`npx supabase db reset` re-applies `migrations/` and `seed.sql` from scratch —
use this whenever you change the schema or want clean seed data back.

## Schema

- `profiles` — 1:1 with `auth.users`, `role` is `customer` | `planner`.
- `planners` / `planner_services` — storefront data, publicly readable.
- `requests` — customer briefs (category, city, date, guests, budget, note).
- `offers` — a planner's quote against a request. Carries both:
  - `status`: `pending` | `viewed` | `accepted` | `declined` | `withdrawn`
    (customer-facing offer state)
  - `deal_status`: the shared deal lifecycle, enforced by the
    `offers_deal_transition` trigger:
    `offer_sent → accepted → countersigned → deposit_paid → completed → reviewed`
    (plus `declined`/`cancelled` as terminal states). Invalid transitions
    raise a Postgres error — see `check_deal_transition()` in
    `migrations/0001_init.sql`.
- `contracts`, `payments`, `bookings`, `reviews` — chain off an accepted offer.
  Inserting a `review` auto-rolls the rating into `planners` and flips the
  offer's `deal_status` to `reviewed`.
- `messages`, `notifications`.

## RLS

- Storefronts (`planners`, `planner_services`) and open `requests` /
  `reviews` are readable by anyone (`anon` included) for browsing.
- Everything else is scoped to participants (the request's `customer_id` or
  the offer's `planner_id`), via the `is_my_request` / `is_offer_participant`
  /  etc. security-definer helpers in `migrations/0003_grants_and_rls_fix.sql`
  (needed to avoid RLS recursion between `requests` and `offers`).

## Seed accounts

All seeded users use password `password123`:

| Email | Role |
|---|---|
| `planner@lumiere-events.sa` | planner (Lumière Events, Riyadh) |
| `noura.alqahtani@example.com` | customer — pending offer |
| `events@faisalgroup.example.com` | customer — viewed offer |
| `sara.hassan@example.com` | customer — accepted offer, awaiting countersign |
| `mona.khalid@example.com` | customer — declined offer |
| `mansour.k@example.com`, `latifa.s@example.com`, `hessa.m@example.com`, `abeer.t@example.com` | customers with open (unanswered) requests |

## End-to-end smoke test

`smoke-test.mjs` exercises the full deal lifecycle (`request → offer_sent →
accepted → countersigned → deposit_paid → completed → reviewed`) against a
running local stack, using the same PostgREST/GoTrue REST calls the apps
make — so it catches RLS and trigger regressions, not just isolated function
bugs. It also checks that illegal transitions (skipping states, mutating a
terminal deal) are rejected.

```
npx supabase start
node supabase/smoke-test.mjs
```

Exits non-zero on any failed assertion. Cleans up its own rows via the
service role on exit (no DELETE RLS policies exist for customers/planners by
design, since deal history is never hard-deleted in the real app).

## Env vars for the apps

After `npx supabase status`, set in `apps/planner/.env.local` and
`apps/customer/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321        # apps/customer
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321        # apps/planner
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from status>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from status>
```

Studio (table editor / SQL): http://127.0.0.1:54323
