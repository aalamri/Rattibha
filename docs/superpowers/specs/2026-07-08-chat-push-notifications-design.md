# Bidirectional chat push notifications — design

Date: 2026-07-08

## Problem

Chat push notifications are one-directional. When a planner sends a message,
the customer's mobile app already receives an OS push (existing, working).
When a **customer** sends a message, the planner never gets any OS-level
notification — `send-push`'s `newMessageMessages` explicitly no-ops for that
case today ("no push token yet on planner side"), because the planner
dashboard is a Next.js web app with no push-token mechanism at all.

Separately, on the customer (mobile) side, tapping a push notification
doesn't take the user anywhere useful — the payload already carries
`data: { screen, requestId/offerId/bookingId }` but nothing in the app
listens for a notification tap, so it just opens to the default screen.

## Scope

In scope:
- Web push (VAPID) for the planner Next.js dashboard, so planners get an OS
  notification when a customer messages them.
- Tap-to-navigate on push notifications in the customer app, using the
  `data.screen` field that's already being sent but never consumed.

Explicitly out of scope (confirmed with the user):
- Customer-side notification coverage for chat, new proposals, countersign,
  and booking confirmation is **already complete** — verified by tracing
  every planner/system-initiated transition in the deal state machine
  (`request → offer_sent → accepted → countersigned → deposit_paid →
  completed → reviewed`, plus `declined`/`cancelled`). The remaining
  transitions are all customer-self-triggered (accept, pay, mark reviewed),
  so there's nothing to notify them about.
- `booking_stage` progression (`planning → design → awaiting_deposit →
  final_walkthrough → completed`) is a real gap in theory, but no planner UI
  exists yet to advance a booking through those stages — it's set once at
  creation and never touched. Building a push trigger for a feature that
  doesn't exist would be speculative; not building it now.
- `new_request` → planner push (planner never gets pushed when a new
  request matches their city/category) is a pre-existing gap, unrelated to
  chat. Not touched by this design.
- Multi-device push subscriptions for planners (see Storage below).
- Cleaning up stale/expired push tokens (Expo or web) on delivery failure —
  matches the existing project convention of not doing this for Expo tokens
  either; noted as a known gap, not fixed here to avoid scope asymmetry.

## Design

### 1. Data model

New migration `supabase/migrations/0023_planner_web_push.sql`:

```sql
alter table profiles add column web_push_subscription jsonb;
```

One subscription per profile row, overwritten on re-subscribe — mirrors the
existing `expo_push_token text` column and its single-token semantics.
Chosen over a separate multi-device table: planners are expected to use one
browser/session in practice, and the existing codebase already has this
exact pattern for the customer app, so this keeps the two sides consistent.

### 2. VAPID keys

Generate one VAPID keypair for the project.

- Public key → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (planner app env, safe to
  expose client-side).
- Private key + subject (`mailto:` contact) → Supabase Edge Function
  secrets: `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Never sent to the client.

### 3. Planner client (`apps/planner`)

- `public/sw.js` — service worker, no build step required (static file).
  - `push` event: parse the JSON payload. Call `clients.matchAll()`; if a
    focused client is already on `/messages`, `postMessage` it instead of
    calling `showNotification` (avoids double-notifying — the in-app bell
    and realtime message list already cover that case). Otherwise show the
    OS notification.
  - `notificationclick` event: focus an existing planner-dashboard client if
    one is open (navigating it via `postMessage`/`client.navigate`), else
    open a new window to `/messages`.
- `src/lib/webPush.ts`:
  - `subscribeToWebPush(userId)`: feature-detect (`'serviceWorker' in
    navigator && 'PushManager' in window`), register the service worker,
    request `Notification.requestPermission()`, on grant call
    `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`,
    write the resulting subscription JSON to
    `profiles.web_push_subscription`.
  - `unsubscribeFromWebPush(userId)`: call `subscription.unsubscribe()` and
    null the column — mirrors `clearPushToken` on the customer side.
- Profile/settings page (`apps/planner/src/app/profile/page.tsx`): add a
  "Message notifications" toggle. No auto-prompt on login — permission is
  only requested when the planner explicitly turns it on. Toggle state is
  derived from whether `profiles.web_push_subscription` is currently set.
- i18n: add the toggle's label/description strings to both
  `apps/planner/src/i18n/locales/en.json` and `ar.json`.

### 4. Edge function (`supabase/functions/send-push/index.ts`)

- Add `import webpush from "npm:web-push@3"` and call
  `webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)`
  once at module scope, reading secrets via `Deno.env.get`.
- `newMessageMessages`: replace the current early-return branch for
  "sender is the customer" with a lookup of the target planner's
  `profiles.web_push_subscription`. If present, send via
  `webpush.sendNotification(subscription, JSON.stringify({ title, body,
  data: { screen: 'messages', requestId } }))` instead of returning `[]`.
- The function now has two independent delivery channels per invocation —
  Expo (existing, for the customer's mobile token) and Web Push (new, for
  the planner's browser subscription). Each recipient uses whichever
  channel their profile row has populated; a single event only ever
  targets one channel today since customer = Expo-only and planner =
  web-push-only.
- Errors from a single `webpush.sendNotification` call are caught
  per-call so one bad subscription doesn't block others (same fire-and-
  forget posture as the existing Expo path — the whole edge function is
  already invoked fire-and-forget from a trigger that swallows errors).

### 5. Customer app — tap-to-navigate (`apps/customer`)

- `apps/customer/src/app/_layout.tsx`: register
  `Notifications.addNotificationResponseReceivedListener` on mount, plus
  check `Notifications.getLastNotificationResponse()` once for cold starts
  (app launched by tapping a notification while fully closed).
- Map `response.notification.request.content.data.screen` to a route:
  - `messages` → `/chat/[requestId]` (using `data.requestId`; also needs
    `plannerId`/`plannerName`/`plannerSeed` route params the chat screen
    expects — payload will need to carry `planner_id` alongside
    `request_id`, which `newMessageMessages` already has available from the
    `messages` row it looked up).
  - `offers` → `/offer/[id]` (using `data.offerId`)
  - `checkout` → `/checkout` (using `data.offerId`)
  - `bookings` → bookings tab (using `data.bookingId`)
- Call `router.push(...)` with the resolved route.

## Error handling / edge cases

- Planner never opts in → `web_push_subscription` stays null →
  `newMessageMessages` finds nothing to send to, no-ops silently (same
  posture as every other branch in this function today).
- Planner revokes browser notification permission externally (via browser
  settings, not the toggle) → next `webpush.sendNotification` call fails
  (410/404) → caught per-call, logged, no retry. Stale subscription is left
  in place (see Scope: not cleaning up stale tokens, matches existing Expo
  behavior).
- Customer taps a notification for a request/offer that's since been
  deleted or is no longer accessible to them → route navigation still
  fires; the destination screen's own existing not-found/empty-state
  handling applies (no special-casing added here).

## Testing / verification approach

Local preview can verify:
- Migration applies cleanly.
- Toggle UI renders, requests permission, and round-trips the subscription
  to `profiles.web_push_subscription` in the dev Supabase project.
- Unsubscribe clears the column.
- Customer-side notification-tap routing logic (can be exercised by
  simulating a notification response object in dev, since Expo Go strips
  real push registration anyway per the existing note in
  `pushNotifications.ts`).

Cannot be verified locally, and will need confirmation after deploy:
- Actual OS-level push delivery end-to-end (requires a deployed HTTPS
  origin + real browser/device — browser push requires a secure context
  outside localhost's exemption, and Expo push tokens don't resolve in the
  simulator).
- `npm:web-push` import compatibility inside the actual Supabase Edge
  Runtime (Deno) — will smoke-test this specifically once deployed, since
  it's new territory for this codebase (only `esm.sh` imports used in
  `send-push`/`send-email` today).
