# Handoff: Rattibha (رتّبها) — Event-Planning Marketplace

**Start with `CLAUDE.md`** (build instructions + stack), then this file for the full spec.

## Overview
**Rattibha** is a bilingual (Arabic RTL + English LTR) two-sided marketplace for Saudi Arabia connecting customers with event planners. **Request-first / reverse-marketplace model:** a customer posts one event brief, verified planners in the same city compete with quotes, and the deal closes in-app (offer → signed contract → protected deposit → review).

Surfaces in this bundle:
1. **Customer mobile app** (iOS) — `ui_kits/app/`
2. **Planner web dashboard** — `ui_kits/planner/`
3. **Marketing website** (desktop) — `ui_kits/website/`
4. **Brand foundations** — `colors_and_type.css`, `assets/`

## About the design files
These are **high-fidelity HTML/JSX prototypes** — references for look, copy and behavior, **not production code to ship**. Recreate them in the target stack (React Native/Expo for the app; Next.js/React for dashboard + site) using its component, routing, state and data patterns. All data/persistence in the prototypes is faked (in-memory state; `localStorage` only for language) — replace with real APIs, auth and a DB.

## Fidelity: high. Recreate colors, type, spacing, radii, shadows, icons, copy and states faithfully.

## Design tokens (source: `colors_and_type.css`)
- **Royal Purple** `#5B2C83` (primary; hover `#4A2369`, pressed `#3A1B52`); tints `#F3EDF8`/`#E7DBF1`/`#A985C9`.
- **Soft Gold** `#D4AF37` (accent; dark `#B5922A`, tint `#EEDFA8`).
- **Lavender** `#B6A1D4` (secondary; tint `#EAE2F4`).
- **Ink** `#2B2233`; text 2/3 `#5C5266`/`#877E92`; canvas `#FAF7F2`; surface `#FFFFFF`; border `#E9E1EE`.
- Success `#2E9E68`, warning `#C9871F`, danger `#C24436`.
- Category accents (within purple→gold→lavender): weddings purple, birthdays gold `#B5922A`, engagements `#7B4FB0`, corporate `#4A2369`, galas `#D4AF37`.
- **Type:** Playfair Display (Latin display, often one italic purple word) · Poppins (Latin UI) · El Messiri (Arabic display) · Tajawal (Arabic UI). Scale px: 76/52/38/27/21 · lead 19 · body 16 · small 14 · caption 12.5 · overline 12 (0.18em, uppercase, gold).
- **Spacing** 4px base (4…96). **Radii** buttons/inputs 14, cards 20, pill 999. **Shadows** purple-tinted (`rgba(43,34,51,…)`); brand glow `0 12px 28px -10px rgba(91,44,131,.45)`. **Motion** ease `cubic-bezier(.22,1,.36,1)` ~240ms; no bounces.

## Iconography
Phosphor (`@phosphor-icons/web@2.1.1`): `ph` regular for nav/metadata, `ph-fill` for active/badges. Use `@phosphor-icons/react` in code. No emoji except occasional chat punctuation.

## Assets (`assets/`)
`logo-primary[-light].png` (stacked mark), `logo-wordmark[-light].png` (inline; **ه** is gold), `glyph-ra[-light].png` (the ر glyph watermark), `app-icon.png` (1024² tile), `pattern.svg` (dot-grid motif). All "photos" are gradient placeholders → replace with real photography.

## Bilingual / RTL (critical)
Equal-weight AR/EN; one toggle flips all surfaces, persisted as `rtb_lang` (`en`|`ar`). Prototypes use a `tr('English')` dictionary lookup (`lang.jsx` per kit) plus `trCity/trMonth/trNum/trDate`. In production use i18next/FormatJS with `en`/`ar` resources + real RTL layout. Pricing SAR; cities in `CITIES` (ui.jsx). User-generated content is not machine-translated.

## Flows (see per-kit READMEs for full screen lists & components)
- **Customer:** Onboarding → Login ⇄ Register (+ Forgot → OTP) → Discover → Post a request (by service+city) → My Requests → Offers inbox → Offer → Sign contract → Checkout → Confirmation → Review. Direct path: planner detail → request to book. Bottom nav: Discover · Requests · Bookings · Messages · Profile. Polish states in `states.jsx`.
- **Planner:** Overview · Open requests (bid, city-scoped + All-KSA) · My Offers (pipeline) · Bookings · Calendar · Messages · Earnings · Storefront; plus Lead detail, Deal timeline (shared 6-stage agreement), Booking detail, Submit quote, editable Storefront (Services manager), Onboarding wizard. Polish states in `states.jsx`.
- **Website:** sticky nav (lang toggle) → hero (search) → categories → featured planners → how-it-works → testimonials → "For planners" CTA → footer. White bg, 1180px content.

## Deal state machine (shared across both apps)
`request → offer_sent → accepted → countersigned → deposit_paid → completed → reviewed`. Take rate 15% on booking value.

## Data model (starting point)
`users`, `planners` (services[], portfolio, city, categories, verified), `requests`, `offers`, `contracts`, `payments`, `bookings`, `reviews`, `messages`, `notifications`, language preference.

## Files
- `CLAUDE.md` — build instructions for Claude Code.
- `colors_and_type.css` — tokens. `assets/` — brand assets.
- `ui_kits/app|planner|website/` — prototypes + per-kit READMEs. Open any `index.html` in a browser as visual reference (loads React + Babel from CDN; toggle `ع / EN`).
