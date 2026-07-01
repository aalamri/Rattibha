# CLAUDE.md — Ratibha build instructions

You are implementing **Ratibha (رتّبها)**, a bilingual (Arabic RTL + English LTR) two-sided
event-planning marketplace for Saudi Arabia. This folder is a **high-fidelity design reference**
(HTML/JSX prototypes) — recreate it in a real codebase, do NOT ship the HTML directly.

## Read first
1. `README.md` (this folder) — full spec: tokens, screens, flows, bilingual rules, deal lifecycle.
2. `colors_and_type.css` — design tokens (source of truth). Port to the theme/Tailwind config.
3. `ui_kits/<surface>/README.md` — per-surface component inventory and file layout.
Open any `ui_kits/<surface>/index.html` in a browser as the visual source of truth; toggle `ع / EN`.

## Tech stack (recommended — confirm with the user before scaffolding)
- **Customer app** (`ui_kits/app/`) → React Native + Expo, NativeWind, expo-localization + i18next (RTL).
- **Planner dashboard** (`ui_kits/planner/`) + **Marketing site** (`ui_kits/website/`) → Next.js (App Router) + Tailwind + react-i18next.
- **Backend** → Supabase (Postgres + Auth + Storage) for an MVP, or Node/Postgres.
- **Icons** → `@phosphor-icons/react` (regular + fill), matching the prototypes.

## Non-negotiables
- **Bilingual, equal weight.** Every UI string flows through i18n with `en` + `ar` resources; persist
  the choice (prototype key: `rtb_lang`). Arabic sets `dir="rtl"`, switches body font to Tajawal, and
  uses Arabic-Indic numerals + localized dates/cities. Do NOT machine-translate user content
  (planner names, bios, reviews).
- **Tokens, not hardcoded values.** Royal Purple `#5B2C83`, Soft Gold `#D4AF37`, Lavender `#B6A1D4`,
  ink `#2B2233`, off-white canvas `#FAF7F2`. Playfair Display + Poppins (Latin), El Messiri + Tajawal (Arabic).
- **Currency = SAR; market = Saudi (Riyadh-first)**; city scopes the RFQ match.
- Match radii (cards 20, buttons/inputs 14), purple-tinted shadows, and the interaction states in the README.

## Build order (lowest risk first)
1. Foundation: theme/tokens, fonts, i18n + RTL setup, base components (Button, Card, Badge, Input, Avatar).
2. Auth: onboarding → login/register → forgot password → OTP.
3. Customer core loop: post request → offers inbox → offer → sign contract → checkout → confirmation → review.
4. Planner side: open-requests board → submit quote → my offers → deal timeline → bookings → storefront.
5. Backend + the shared **deal state machine**:
   `request → offer_sent → accepted → countersigned → deposit_paid → completed → reviewed`.
6. Polish: skeletons, empty states, toasts; then the marketing website.

## Data model (starting point)
`users`, `planners` (profile + services[] + portfolio + city + categories + verified),
`requests` (customer brief: type, city, date, guests, budget, note),
`offers` (planner quote against a request: price, package, message, status),
`contracts` (signed agreement per accepted offer), `payments` (deposit/balance),
`bookings`, `reviews`, `messages`, `notifications`. Take rate: 15% on booking value.

Reimplement faithfully and idiomatically. When unsure about a visual detail, open the matching
prototype HTML and diff against it.
