# Rattibha — Planner Dashboard UI kit

A high-fidelity, click-through recreation of the **Rattibha planner-facing web dashboard** — where event planners manage their business on the marketplace. Desktop, **1320×860** app frame (scales to fit). Open `index.html`.

## Views (sidebar)
0. **Onboarding** (`onboarding.html`) — a standalone **signup wizard** for new planners: Account → Business → Services & pricing → Portfolio → Verification, ending in an **“application submitted / under review”** state with a status timeline. Entered from the marketing site's “Become a planner” CTA; “Preview my dashboard” links into `index.html`.
1. **Overview** — KPI cards (new leads, active bookings, revenue, rating), a revenue bar chart, recent-activity feed, newest-leads and upcoming-events lists.
2. **Leads & Offers** — incoming event requests as cards (type / date / guests / city / budget), filter tabs, and a slide-in **Send-offer drawer** (pick package, set price, pre-filled message, attach portfolio).
3. **Bookings** — table of confirmed & pending events with payment progress and status.
4. **Calendar** — month grid with color-coded events + a "This month" agenda rail.
5. **Messages** — two-pane client conversations (list + thread, "Create booking" action).
6. **Earnings** — available balance, monthly revenue, pending payouts, and a transactions table.
7. **Storefront (Profile)** — public profile, portfolio grid, performance metrics, rating breakdown.

## Files
- `index.html` — loads tokens, fonts, Phosphor, React/Babel; owns the `App` router (sidebar view switch, `?view=` deep-link) and the 1320×860 scaling frame.
- `dash.jsx` — shared tokens (`C`), `SANS`/`DISPLAY`, primitives (`Avatar`, `Photo`, `Badge`, `Btn`, `Card`), and all fake data (`PLANNER`, `NAV`, `LEADS`, `BOOKINGS`, `MESSAGES`, `ACTIVITY`).
- `shell.jsx` — `Sidebar`, `Topbar`, `OverviewView`.
- `leads.jsx` — `LeadsView` + `OfferDrawer`.
- `onboarding.jsx` — `OnboardingWizard` (5 steps + submitted/pending state) + `onboarding.html` entry. Loads only `dash.jsx` + `onboarding.jsx`.
- `views.jsx` — `BookingsView`, `CalendarView`, `EarningsView`.
- `views2.jsx` — `MessagesView`, `ProfileView`.
- `detail.jsx` — `LeadDetailView` (request + match score + competition rail) and `BookingDetailView` (timeline, planning checklist, payment progress). Opened via `go('leadDetail', lead)` / `go('bookingDetail', booking)` from lead cards, booking rows, and the Overview lists.
- `states.jsx` — planner polish/loading states: `PSkel`, `RequestCardSkeleton`, `BrowseSkeleton`, `RowSkeleton`, `PEmpty`, and a `PToastHost` mounted in `App` (call `window.rtbPlToast({tone,title,sub})`). Wired in: the Open-requests board shows `BrowseSkeleton` on first load (~1.1s) and a `PEmpty` empty state when no briefs match; sending a proposal fires a success toast. All bilingual.
- `deal.jsx` — `DealView`: the planner-side mirror of the customer deal lifecycle (request received → offer sent → client accepted → **countersign** → deposit → event) with a shared timeline, contract-to-countersign, and payment/earnings rail. Opened via `go('deal', lead)` from the offer-sent lead card, lead detail, and after sending an offer in the drawer.
- `browse.jsx` — `BrowseRequestsView` (the **Open requests** marketplace board: posted customer briefs with match scores, filter by category) and `SubmitProposalView` (bid on a brief — package + price slider + message + payout preview). Mirrors the customer's "Post a request" → multiple planners quote. Nav: "Open requests" → board → "Send quote" → submit → "My Offers".
- `profile-edit.jsx` — `ProfileEditView`: editable storefront — replace cover/logo/portfolio images (camera-overlay placeholders), edit name/specialty/city/bio, toggle event categories, and a **Services manager** (each service = name + image + price; add via preset picker, edit, delete). Opened from the Profile "Edit"/"Manage" buttons; `ProfileView` (in `views2.jsx`) also shows a read-only Services grid.
- `view-*.html` — standalone single-view boots for the Design System tab (copies of `index.html` with the initial view hardcoded).

## Conventions
- Light purple-gray app background (`#F7F4FA`), white cards (`r:18`, 1px hairline border, soft purple-tinted shadow), royal-purple primary, gold for premium/ratings, lavender + category hues for accents.
- Playfair Display for page titles & big numbers; Poppins for everything else. Phosphor icons (`ph` / `ph-fill`).
- Components export to `window` at the end of each babel file (each `<script type="text/babel">` is its own scope).
- Pricing in **SAR**; market is Saudi (Riyadh-first). The رتّبها wordmark sits in the sidebar; the ر glyph appears on dark promo/earnings cards.

## To extend
Add a view component, export it on `window`, add a `case` in `App`'s switch + an entry in `NAV` (`dash.jsx`) and `TITLES` (`index.html`). Reuse `Card`, `Btn`, `Badge`, `Avatar` for consistency. Replace `Photo` gradient placeholders with real photography.
