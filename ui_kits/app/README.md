# Rattibha — Customer App UI kit

A high-fidelity, click-through recreation of the **Rattibha customer mobile app** (iOS). Open `index.html`.

## Flow
**Reverse-marketplace (Upwork-style):** Discover → **Post a request** (broadcast a brief by service — not tied to one planner) → **Request posted** → **Offers inbox** (multiple planners reply with competing quotes; sort by best match / price / rating) → tap a quote → **Offer & agreement** → **Sign contract** → **Checkout** (deposit) → **Confirmation**. After the event: **Leave a review**.

A direct path also exists: tap a planner → **Planner detail** → **Request to book** (single-planner request) → same offer → contract → pay chain. Payment only happens after both sides agree and the contract is signed. Plus tab destinations: **Bookings** → **Booking detail** (timeline + payment), **Messages** → **Chat**, **Profile** → **Saved** / **Notifications**. Entry/auth: **Onboarding** → **Login** ⇄ **Register**, with **Forgot password** → **OTP verification**. Discover's bell opens **Notifications**; the search bar opens **Search** (live filter + **Filter** bottom-sheet). Navigation is a simple screen stack (`go(screen, data)` / `back()`); tabs reset the stack. The router reads an optional `?screen=` param for the initial screen (used by the standalone `screen-*.html` preview cards).

## Files
- `index.html` — loads tokens, fonts, Phosphor, React/Babel, mounts `App` inside the iOS device frame; owns the router, `ScreenShell` (scroll layer + anchored footer), and the Bookings/Profile screens.
- `ui.jsx` — shared primitives + fake data: `C` (colors), `SANS`/`DISPLAY`, `Photo`, `Badge`, `Stars`, `Btn`, `Avatar`, and the `PLANNERS` / `CATEGORIES` / `REVIEWS` datasets.
- `screens.jsx` — `DiscoverScreen`, `PlannerScreen` (+ `PlannerFooter`), `Header`, `PlannerRow`, `SectionTitle`.
- `screens2.jsx` — `BookingScreen` (+ `BookingFooter`), `ConfirmScreen`, `MessagesScreen`, `ChatScreen`, `BottomNav`.
- `screens3.jsx` — `OnboardingScreen`, `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `OTPVerificationScreen`, `SearchScreen` (+ `FilterSheet`), `NotificationsScreen`, `SavedScreen`, `BookingDetailScreen`.
- `screens4.jsx` — `CheckoutScreen` (+ `CheckoutFooter`) and `ReviewScreen` (+ `ReviewFooter`).
- `states.jsx` — polish/loading states: `Skel`, `PlannerRowSkeleton`, `FeaturedCardSkeleton`, `DiscoverSkeleton`, `EmptyState`, `Toast`, `Spinner`, and a `ToastHost` mounted in `App` (call `window.rtbToast({tone,title,sub})` imperatively). Wired in: Discover shows `DiscoverSkeleton` on first load (~1.1s), Saved shows an `EmptyState` when empty, and submitting a review fires a success toast. `states-showcase.html` is the Design System card.
- `screens6.jsx` — reverse-marketplace: `PostRequestScreen` (+ `PostRequestFooter`) broadcasts a brief by service; `ProposalsScreen` is the offers inbox comparing competing planner quotes; `RequestsScreen` is the **My requests** tab (tracks open/booked briefs with offer counts + new-offer badges). The Discover hero leads with a “Post a request” CTA; the bottom nav now has 5 tabs (Discover · Requests · Bookings · Messages · Profile); `RequestSentScreen` (in `screens5.jsx`) switches to broadcast copy + routes to `proposals` when `data.broadcast` is set.
- `screen-*.html` — standalone single-screen boots (Onboarding / Login / Search / Notifications) for the Design System tab; each is a copy of `index.html` with the initial screen hardcoded.
- `ios-frame.jsx` — device bezel starter (status bar, dynamic island, home indicator).

## Conventions
- Components are factored small and share scope via `Object.assign(window, …)` at the end of each babel file (each `<script type="text/babel">` is its own scope).
- Sticky footers are **not** placed inside scroll content — screens expose a `*Footer` component that `ScreenShell` anchors over a separate scroll layer.
- Off-white canvas, white cards (`r:18–20`, purple-tinted shadow, 1px hairline border), royal-purple primary buttons with a purple glow, Phosphor icons (`ph` / `ph-fill`). Pricing in **SAR**; market is Saudi Arabia (Riyadh-first). The Discover header has a **city selector** (bottom-sheet picker of Saudi cities + "All Saudi Arabia") that filters the featured/nearby planner lists; the search Filter sheet also has a City group. City list lives in `CITIES` (ui.jsx). **City drives the RFQ match end-to-end** (customer posts in their city → only same-city planners respond; planner board defaults to their own city + All-KSA toggle). **Bilingual EN/AR with RTL:** `lang.jsx` holds the dictionary (`tr`, `trCity`, `trCat`, `trPlanner`); a **ع / EN toggle** in the Discover header flips `window.__lang`, persists it, and sets `dir="rtl"` + Arabic font on the device. Discover, bottom nav, city picker and planner rows are fully translated; other screens flip to RTL and translate by wrapping strings in `tr()`. is Saudi (Riyadh-first).

## To extend
Add a screen component, export it on `window` (end of `screens*.jsx`), then add a `case` in `App`'s switch in `index.html`. If the screen manages its own full-bleed layout (no bottom nav / top inset), add its key to the `fullBleed` check. Reuse `Btn`, `Badge`, `Photo`, `Avatar` for consistency. Replace `Photo` gradient placeholders with real photography.
