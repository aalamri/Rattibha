# Bidirectional Chat Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Planners receive a browser push notification when a customer messages them (currently silently dropped), and tapping any push notification in the customer app navigates to the right screen (currently the tap data is ignored).

**Architecture:** Add Web Push (VAPID) support to the planner Next.js dashboard — a `web_push_subscription` jsonb column on `profiles`, a static service worker, a subscribe/unsubscribe client lib, and an opt-in toggle. Extend the `send-push` Supabase Edge Function to dispatch over two channels (Expo for the customer's mobile token, Web Push for the planner's browser subscription) and to embed a `{ type, payload }` shape in every notification's `data` field that mirrors the existing in-app `notifications` table rows. On the customer side, extract the existing `notificationRoute()` route-mapping function (already used for in-app notification taps) into a shared module and reuse it to handle push-notification taps too.

**Tech Stack:** Supabase (Postgres + Edge Functions/Deno), Next.js 16 (planner dashboard), Expo/React Native (customer app), native browser Push API + Service Workers, `web-push` npm package (via Deno `npm:` specifier) for VAPID-signed delivery.

## Global Constraints

- Bilingual, equal weight: every new user-facing string ships in both `en.json` and `ar.json` (CLAUDE.md non-negotiable). No machine translation shortcuts — write natural copy in both languages.
- Follow existing codebase conventions exactly: hand-written `database.types.ts` (no `supabase gen types`), jsonb columns typed as `Record<string, unknown> | null`, RTL via logical CSS properties (`start-`/`end-`, flex `justify-start`/`justify-end`) not `rtl:` variants.
- No test framework exists in this repo (no jest/vitest configured in either app's `package.json`). Verification uses `tsc --noEmit`, `eslint`, and manual/DB-level checks instead of automated unit tests — this matches the project's existing testing posture, not a shortcut.
- Do not add stale-subscription/token cleanup logic — matches the existing convention of not doing this for Expo tokens either (see design spec's explicit non-goals).

---

## Task 1: Add `web_push_subscription` column and update planner's DB types

**Files:**
- Create: `supabase/migrations/0023_planner_web_push.sql`
- Modify: `apps/planner/src/lib/database.types.ts:34`

**Interfaces:**
- Produces: `profiles.web_push_subscription` (jsonb, nullable) — every later task that reads/writes a planner's push subscription uses this exact column name.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0023_planner_web_push.sql`:

```sql
-- Enables browser (Web Push) notifications for planners. The planner
-- dashboard is a web app, not a native app, so it can't use the
-- expo_push_token column customers use — a Web Push subscription is a
-- structured object (endpoint + encryption keys), not a single string
-- token, hence jsonb rather than text.
alter table profiles add column web_push_subscription jsonb;
```

No RLS change needed: `profiles_update_own` (`supabase/migrations/0002_rls.sql`) already grants row-level update access to `id = auth.uid()`, which covers this new column.

- [ ] **Step 2: Apply the migration**

If the Supabase CLI is installed and the project is linked, run:

```bash
supabase db reset
```

Expected: migration `0023_planner_web_push.sql` runs without error alongside all prior migrations.

If the CLI isn't available in your environment, open the Supabase dashboard's SQL editor for the linked project and run the `alter table` statement directly, then confirm via:

```sql
select column_name, data_type from information_schema.columns
where table_name = 'profiles' and column_name = 'web_push_subscription';
```

Expected: one row, `data_type = 'jsonb'`.

- [ ] **Step 3: Update the planner's hand-written DB types**

In `apps/planner/src/lib/database.types.ts`, the `profiles.Row` type currently reads (line 26-37):

```typescript
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          language: AppLanguage;
          city: CityKey | null;
          avatar_seed: number;
          expo_push_token: string | null;
          is_admin: boolean;
          created_at: string;
        };
```

Add the new column right after `expo_push_token`:

```typescript
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          language: AppLanguage;
          city: CityKey | null;
          avatar_seed: number;
          expo_push_token: string | null;
          web_push_subscription: Record<string, unknown> | null;
          is_admin: boolean;
          created_at: string;
        };
```

(`Insert`/`Update` are already `Partial<Row>` — no change needed there.)

- [ ] **Step 4: Verify the type change compiles**

```bash
cd apps/planner && npx tsc --noEmit
```

Expected: no new errors (pre-existing errors, if any, are unrelated — only confirm this change didn't introduce new ones).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0023_planner_web_push.sql apps/planner/src/lib/database.types.ts
git commit -m "Add web_push_subscription column for planner browser push"
```

---

## Task 2: Generate VAPID keys and configure secrets

**Files:**
- Modify: `apps/planner/.env.local` (not committed — gitignored, confirm with `git check-ignore apps/planner/.env.local`)

**Interfaces:**
- Produces: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (planner client env var), and three Supabase Edge Function secrets — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — that Task 5's edge function code reads via `Deno.env.get(...)`.

- [ ] **Step 1: Generate a VAPID keypair**

Run locally (no install needed, uses npx):

```bash
npx web-push@3 generate-vapid-keys
```

Expected output shape:

```
=======================================

Public Key:
<a ~87-character base64url string>

Private Key:
<a ~43-character base64url string>

=======================================
```

Copy both values — they're project secrets, generated once and reused. Do not commit them anywhere.

- [ ] **Step 2: Add the public key to the planner's local env**

Confirm the file is gitignored first:

```bash
git check-ignore apps/planner/.env.local
```

Expected: prints the path (confirms it won't be committed). Then append to `apps/planner/.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<the public key from Step 1>
```

- [ ] **Step 3: Set the Edge Function secrets**

Requires the Supabase CLI logged in and the project linked (same setup already required for the existing `RESEND_API_KEY` secret used by `send-email`):

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY=<the public key from Step 1> \
  VAPID_PRIVATE_KEY=<the private key from Step 1> \
  VAPID_SUBJECT=mailto:support@ratibha.com
```

(`VAPID_SUBJECT` is a contact address VAPID puts in its signed JWT so push services can reach you about delivery problems — reusing the support address is fine; change it if the project has a different preferred contact.)

- [ ] **Step 4: Verify the secrets are set**

```bash
supabase secrets list
```

Expected: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` appear in the list (values are redacted in the CLI output — presence is what you're confirming).

- [ ] **Step 5: Commit**

Nothing to commit from this task — `.env.local` is gitignored and secrets live only in Supabase. If Step 2 required creating `apps/planner/.env.local` from scratch (it shouldn't — it already exists per the repo's current state), double-check it's still ignored:

```bash
git status
```

Expected: `apps/planner/.env.local` does not appear in the output.

---

## Task 3: Planner service worker

**Files:**
- Create: `apps/planner/public/sw.js`

**Interfaces:**
- Consumes: nothing from other tasks (static asset, served as-is by Next.js from `public/`).
- Produces: a service worker registered at scope `/`, listening for `push` and `notificationclick` events. Task 4's `webPush.ts` registers this file by path (`/sw.js`).

- [ ] **Step 1: Write the service worker**

Create `apps/planner/public/sw.js`:

```javascript
// Planner dashboard service worker — shows incoming Web Push notifications
// and routes taps back into the app. Static file, no build step: registered
// directly from src/lib/webPush.ts via navigator.serviceWorker.register('/sw.js').

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const title = payload.title || 'Ratibha';
  const options = {
    body: payload.body || '',
    data: { url: '/messages' },
  };

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const focusedOnMessages = clientsList.some(
        (client) => client.visibilityState === 'visible' && client.url.includes('/messages')
      );

      // Planner already has the messages page open and focused — they'll
      // see the new message land via the existing realtime subscription
      // and the in-app notification bell, so don't also show an OS
      // notification on top of that.
      if (focusedOnMessages) {
        clientsList.forEach((client) => client.postMessage({ type: 'push-received', payload }));
        return;
      }

      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/messages';

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const targetPath = new URL(targetUrl, self.location.origin).pathname;
      const existing = clientsList.find((client) => client.url.includes(targetPath));

      if (existing) {
        await existing.focus();
        return;
      }

      const anyClient = clientsList[0];
      if (anyClient && 'navigate' in anyClient) {
        await anyClient.navigate(targetUrl);
        await anyClient.focus();
        return;
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
```

- [ ] **Step 2: Verify it's served**

```bash
cd apps/planner && npm run dev
```

In another terminal:

```bash
curl -sI http://localhost:3000/sw.js | head -1
```

Expected: `HTTP/1.1 200 OK` (Next.js serves anything under `public/` at the site root automatically — no route file needed).

- [ ] **Step 3: Commit**

```bash
git add apps/planner/public/sw.js
git commit -m "Add planner service worker for Web Push"
```

---

## Task 4: Planner web push subscribe/unsubscribe library

**Files:**
- Create: `apps/planner/src/lib/webPush.ts`

**Interfaces:**
- Consumes: `apps/planner/src/lib/supabase.ts` (`supabase` client), `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Task 2), `/sw.js` (Task 3).
- Produces: `isWebPushSupported(): boolean`, `subscribeToWebPush(userId: string): Promise<'subscribed' | 'denied' | 'unsupported'>`, `unsubscribeFromWebPush(userId: string): Promise<void>` — Task 6's profile toggle calls these three by exact name.

- [ ] **Step 1: Write the library**

Create `apps/planner/src/lib/webPush.ts`:

```typescript
import { supabase } from './supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Registers the service worker, requests notification permission, subscribes
 * to push, and persists the subscription to profiles.web_push_subscription.
 * Only called from an explicit user action (a toggle) — never on page load,
 * since browsers penalize auto-prompting for notification permission.
 */
export async function subscribeToWebPush(userId: string): Promise<'subscribed' | 'denied' | 'unsupported'> {
  if (!isWebPushSupported()) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return 'unsupported';

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await supabase
    .from('profiles')
    .update({ web_push_subscription: subscription.toJSON() as Record<string, unknown> })
    .eq('id', userId);

  return 'subscribed';
}

/**
 * Unsubscribes at the browser level and clears the stored subscription so
 * send-push stops targeting this planner. Mirrors clearPushToken in the
 * customer app (apps/customer/src/lib/pushNotifications.ts).
 */
export async function unsubscribeFromWebPush(userId: string): Promise<void> {
  if (isWebPushSupported()) {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  }

  await supabase.from('profiles').update({ web_push_subscription: null }).eq('id', userId);
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/planner && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add apps/planner/src/lib/webPush.ts
git commit -m "Add planner web push subscribe/unsubscribe library"
```

---

## Task 5: Notifications toggle on the planner profile page

**Files:**
- Modify: `apps/planner/src/app/profile/page.tsx`
- Modify: `apps/planner/src/i18n/locales/en.json:315`
- Modify: `apps/planner/src/i18n/locales/ar.json:315`

**Interfaces:**
- Consumes: `subscribeToWebPush`, `unsubscribeFromWebPush` (Task 4), `profile.web_push_subscription` (Task 1, available via existing `useAuth()`).

- [ ] **Step 1: Add the i18n strings**

In `apps/planner/src/i18n/locales/en.json`, the `profile` section currently has (around line 312-316):

```json
    "editTitle": "Edit storefront",
    "save": "Save changes",
    "cancel": "Cancel",
    "saved": "Changes saved",
    "fields": {
```

Insert a new `notifications` key between `"saved"` and `"fields"`:

```json
    "editTitle": "Edit storefront",
    "save": "Save changes",
    "cancel": "Cancel",
    "saved": "Changes saved",
    "notifications": {
      "title": "Notifications",
      "toggleLabel": "Message notifications",
      "toggleDescription": "Get notified in your browser when a customer sends you a message.",
      "permissionDenied": "Notifications are blocked in your browser settings. Enable them for this site to turn this on.",
      "unsupported": "Your browser doesn't support push notifications."
    },
    "fields": {
```

- [ ] **Step 2: Add the matching Arabic strings**

In `apps/planner/src/i18n/locales/ar.json`, the equivalent block currently reads (around line 312-316):

```json
    "editTitle": "تعديل المتجر",
    "save": "حفظ التغييرات",
    "cancel": "إلغاء",
    "saved": "تم الحفظ",
    "fields": {
```

Insert:

```json
    "editTitle": "تعديل المتجر",
    "save": "حفظ التغييرات",
    "cancel": "إلغاء",
    "saved": "تم الحفظ",
    "notifications": {
      "title": "الإشعارات",
      "toggleLabel": "إشعارات الرسائل",
      "toggleDescription": "احصل على إشعار في متصفحك عندما يرسل لك عميل رسالة.",
      "permissionDenied": "الإشعارات محظورة في إعدادات متصفحك. فعّلها لهذا الموقع لتتمكن من تشغيل هذا الخيار.",
      "unsupported": "متصفحك لا يدعم الإشعارات الفورية."
    },
    "fields": {
```

- [ ] **Step 3: Add the toggle component and imports**

In `apps/planner/src/app/profile/page.tsx`, add the import at the top, alongside the existing `@/lib/*` imports (after line 17, `import { supabase } from '@/lib/supabase';`):

```typescript
import { subscribeToWebPush, unsubscribeFromWebPush } from '@/lib/webPush';
```

Then add a new local component right after `SeedSwatchPicker` (after line 105, before `interface EditableService`):

```typescript
function NotificationsSection() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<'denied' | 'unsupported' | null>(null);

  const enabled = !!profile?.web_push_subscription;

  async function handleToggle() {
    if (!session) return;
    setWorking(true);
    setError(null);

    if (enabled) {
      await unsubscribeFromWebPush(session.user.id);
    } else {
      const result = await subscribeToWebPush(session.user.id);
      if (result !== 'subscribed') setError(result);
    }

    setWorking(false);
  }

  return (
    <Section title={t('profile.notifications.title')}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[13.5px] font-semibold text-fg1">{t('profile.notifications.toggleLabel')}</div>
          <div className="mt-0.5 text-xs text-fg3">{t('profile.notifications.toggleDescription')}</div>
          {error === 'denied' && (
            <div className="mt-1.5 text-xs font-semibold text-danger">{t('profile.notifications.permissionDenied')}</div>
          )}
          {error === 'unsupported' && (
            <div className="mt-1.5 text-xs font-semibold text-danger">{t('profile.notifications.unsupported')}</div>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('profile.notifications.toggleLabel')}
          disabled={working}
          onClick={handleToggle}
          className={`flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${
            enabled ? 'justify-end bg-brand' : 'justify-start bg-border'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </button>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Render it in the page**

In the same file, the right rail currently ends with (around line 589-593):

```tsx
          </Section>

          <Button variant="secondary" icon={StorefrontIcon} className="w-full">
            {t('profile.view')}
          </Button>
        </div>
```

Add `<NotificationsSection />` between the portfolio `Section` and the button:

```tsx
          </Section>

          <NotificationsSection />

          <Button variant="secondary" icon={StorefrontIcon} className="w-full">
            {t('profile.view')}
          </Button>
        </div>
```

- [ ] **Step 5: Verify types and lint**

```bash
cd apps/planner && npx tsc --noEmit && npm run lint
```

Expected: no new errors from either command.

- [ ] **Step 6: Manual verification in the browser**

```bash
npm run dev
```

Open `http://localhost:3000/profile` as a logged-in planner, and check:
- The "Notifications" section renders with the toggle off (assuming no prior subscription).
- Clicking it triggers the browser's native notification-permission prompt.
- After granting permission, the toggle switches to "on" and stays on after a page reload (confirms the subscription round-tripped to `profiles.web_push_subscription` — verify directly with `select web_push_subscription from profiles where id = '<planner id>';` in the Supabase SQL editor, expect a non-null jsonb object with `endpoint` and `keys`).
- Clicking it again while on turns it back off, and `web_push_subscription` goes back to `null`.
- Switch the language toggle to Arabic and confirm the section's copy renders in Arabic with `dir="rtl"` layout (toggle still visually on the correct side per the `justify-start`/`justify-end` implementation — no mirrored/broken layout).

- [ ] **Step 7: Commit**

```bash
git add apps/planner/src/app/profile/page.tsx apps/planner/src/i18n/locales/en.json apps/planner/src/i18n/locales/ar.json
git commit -m "Add message-notifications opt-in toggle to planner profile"
```

---

## Task 6: Extract `notificationRoute` into a shared customer-app module

**Files:**
- Create: `apps/customer/src/lib/notificationRoute.ts`
- Modify: `apps/customer/src/app/notifications.tsx`

**Interfaces:**
- Produces: `notificationRoute(n: { type: string; payload: Record<string, unknown> }): { pathname: string; params?: Record<string, string> } | null`, plus exported `NotifType` and `Notif` types — Task 7's push-tap handler imports `notificationRoute` by this exact name and signature.

This is a pure refactor (move code, no behavior change) — do it before Task 7 so the tap handler and the in-app notification list share one implementation instead of drifting into two.

- [ ] **Step 1: Create the shared module**

Create `apps/customer/src/lib/notificationRoute.ts`:

```typescript
export type NotifType = 'offer_received' | 'offer_accepted' | 'booking_confirmed' | 'message' | string;

export interface Notif {
  id: string;
  type: NotifType;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export function notificationRoute(
  n: Pick<Notif, 'type' | 'payload'>
): { pathname: string; params?: Record<string, string> } | null {
  const p = n.payload ?? {};
  switch (n.type) {
    case 'offer_received':
      return p.request_id ? { pathname: '/proposals', params: { id: String(p.request_id) } } : null;
    case 'offer_accepted':
      return p.offer_id ? { pathname: '/checkout', params: { offerId: String(p.offer_id) } } : null;
    case 'booking_confirmed':
      return p.booking_id ? { pathname: '/booking/[id]', params: { id: String(p.booking_id) } } : null;
    case 'message':
      return p.request_id && p.planner_id
        ? {
            pathname: '/chat/[requestId]',
            params: {
              requestId: String(p.request_id),
              plannerId: String(p.planner_id),
              plannerName: String(p.planner_name ?? ''),
              plannerSeed: String(p.planner_seed ?? 0),
            },
          }
        : null;
    default:
      return null;
  }
}
```

This is a verbatim move of the `NotifType`, `Notif`, and `notificationRoute` currently defined inline in `apps/customer/src/app/notifications.tsx` — no logic changes.

- [ ] **Step 2: Update `notifications.tsx` to import instead of define**

In `apps/customer/src/app/notifications.tsx`, remove the local `type NotifType = ...` declaration, the local `interface Notif { ... }`, and the local `function notificationRoute(n: Notif): ... { ... }` (the three blocks this task's Step 1 moved verbatim). Add an import alongside the existing `@/lib/*` imports:

```typescript
import { notificationRoute, type Notif } from '@/lib/notificationRoute';
```

Everything else in the file (`TYPE_ICON`, `timeAgo`, `describe`, the component itself) stays as-is — it already references `Notif` and `notificationRoute` by name, and those names now resolve to the import instead of the local declarations.

- [ ] **Step 3: Verify types**

```bash
cd apps/customer && npx tsc --noEmit
```

Expected: no new errors. If `Notif` or `notificationRoute` show as unused-import or missing-reference errors, confirm every local usage site in the file was left intact (only the *declarations* were removed, not the usages).

- [ ] **Step 4: Manual verification**

```bash
npm run start
```

Open the customer app, navigate to the notifications screen, and confirm it still renders and tapping a notification still navigates correctly (no behavior change expected — this step is confirming the refactor didn't break anything).

- [ ] **Step 5: Commit**

```bash
git add apps/customer/src/lib/notificationRoute.ts apps/customer/src/app/notifications.tsx
git commit -m "Extract notificationRoute into a shared module"
```

---

## Task 7: Wire push-notification-tap routing in the customer app

**Files:**
- Modify: `apps/customer/src/app/_layout.tsx`

**Interfaces:**
- Consumes: `notificationRoute` (Task 6), `expo-notifications` (already a dependency, already imported in `apps/customer/src/lib/pushNotifications.ts`).

- [ ] **Step 1: Add the imports**

In `apps/customer/src/app/_layout.tsx`, add two imports alongside the existing ones (after line 9, `import { SafeAreaProvider } from 'react-native-safe-area-context';`):

```typescript
import * as Notifications from 'expo-notifications';

import { notificationRoute } from '@/lib/notificationRoute';
```

- [ ] **Step 2: Wire the tap handler into `AppShell`**

The `AppShell` component currently reads (lines 103-112):

```tsx
function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { resolvedScheme } = useThemeMode();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
```

Replace it with:

```tsx
function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { resolvedScheme } = useThemeMode();
  const router = useRouter();

  useEffect(() => {
    function handleResponse(response: Notifications.NotificationResponse) {
      const data = response.notification.request.content.data as
        | { type?: string; payload?: Record<string, unknown> }
        | undefined;
      if (!data?.type) return;
      const route = notificationRoute({ type: data.type, payload: data.payload ?? {} });
      if (route) router.push(route as never);
    }

    // Cold start: app was fully closed and launched by tapping a notification.
    Notifications.getLastNotificationResponse().then((response) => {
      if (response) handleResponse(response);
    });

    // Warm/background: app was already running (foreground or backgrounded).
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
```

`AppShell` is rendered inside `RouteGuard` (see the `RootLayout` return block later in the same file), which only renders its children once `loading` is false — so by the time this effect runs, auth state has already settled and the RouteGuard redirect race is avoided.

`useRouter` is already imported at the top of the file (line 3, `import { Stack, useRouter, useSegments, ... } from 'expo-router';`) — no new import needed for it.

- [ ] **Step 3: Verify types**

```bash
cd apps/customer && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Manual verification**

This needs a real device or simulator with a development build (Expo Go blocks `expo-notifications` per the existing note in `apps/customer/src/lib/pushNotifications.ts`) and won't be fully exercisable in the local preview. As a partial check, confirm the wiring compiles and doesn't throw at runtime by simulating a response object in the Metro/dev console:

```bash
npm run ios   # or: npm run android
```

Once running, in the dev tools console (or a temporary debug button) call:

```javascript
notificationRoute({ type: 'message', payload: { request_id: 'test', planner_id: 'test', planner_name: 'Test Planner', planner_seed: 0 } })
```

Expected: returns `{ pathname: '/chat/[requestId]', params: { requestId: 'test', plannerId: 'test', plannerName: 'Test Planner', plannerSeed: '0' } }` — confirms the route-building logic is sound. Full end-to-end (real push → tap → navigate) needs a deployed build; note this as pending post-deploy verification (see Task 9).

- [ ] **Step 5: Commit**

```bash
git add apps/customer/src/app/_layout.tsx
git commit -m "Route push-notification taps to the matching screen"
```

---

## Task 8: Rewrite `send-push` to dispatch over Expo and Web Push, with unified `{ type, payload }` data

**Files:**
- Modify: `supabase/functions/send-push/index.ts` (full rewrite)

**Interfaces:**
- Consumes: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (Task 2 secrets), `profiles.web_push_subscription` (Task 1), the exact `notificationRoute` payload shapes expected by Task 6 (`offer_received` → `{request_id, offer_id, planner_id, planner_name, price}`, `offer_accepted` → `{request_id, offer_id, planner_id, planner_name}`, `booking_confirmed` → `{booking_id, request_id, planner_id, planner_name}`, `message` → `{request_id, message_id, planner_id, planner_name, planner_seed, preview}`).
- Produces: no change to the function's external trigger contract — still invoked the same way by `private.notify_push` in `supabase/migrations/0007_push_triggers.sql` with the same four `event` values.

- [ ] **Step 1: Replace the file**

Replace the entire contents of `supabase/functions/send-push/index.ts` with:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@ratibha.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

interface PushPayload {
  event: 'new_offer' | 'new_message' | 'countersigned' | 'booking_confirmed';
  // IDs needed to look up the target user's push token/subscription
  offer_id?: string;
  message_id?: string;
  booking_id?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const body: PushPayload = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { expo, web } = await buildMessages(supabase, body);

    if (expo.length === 0 && web.length === 0) {
      return new Response('no-op', { status: 200 });
    }

    const results: Record<string, unknown> = {};

    if (expo.length > 0) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(expo),
      });
      results.expo = await res.json();
    }

    if (web.length > 0) {
      results.web = await Promise.allSettled(
        web.map((target) => webpush.sendNotification(target.subscription, JSON.stringify(target.payload))),
      );
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});

// ─── Message builders ────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createClient>;

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
}

interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface WebPushTarget {
  subscription: WebPushSubscription;
  payload: { title: string; body: string };
}

interface BuildResult {
  expo: ExpoMessage[];
  web: WebPushTarget[];
}

const EMPTY: BuildResult = { expo: [], web: [] };

async function buildMessages(supabase: SupabaseClient, payload: PushPayload): Promise<BuildResult> {
  switch (payload.event) {
    case 'new_offer':
      return newOfferMessages(supabase, payload.offer_id!);
    case 'new_message':
      return newMessageMessages(supabase, payload.message_id!);
    case 'countersigned':
      return countersignedMessages(supabase, payload.offer_id!);
    case 'booking_confirmed':
      return bookingConfirmedMessages(supabase, payload.booking_id!);
    default:
      return EMPTY;
  }
}

// New offer → notify customer
async function newOfferMessages(supabase: SupabaseClient, offerId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('offers')
    .select('request_id, planner_id, price, planners(business_name), requests(customer_id, profiles(expo_push_token, language))')
    .eq('id', offerId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    request_id: string;
    planner_id: string;
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { expo_push_token: string | null; language: string } | null;
    } | null;
  };

  const token = row.requests?.profiles?.expo_push_token;
  if (!token) return EMPTY;

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';
  const price = row.price.toLocaleString();

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'عرض جديد 🎉' : 'New offer 🎉',
      body: ar
        ? `${plannerName} أرسل لك عرضاً بـ ${price} ر.س`
        : `${plannerName} sent you an offer for SAR ${price}`,
      data: {
        type: 'offer_received',
        payload: {
          request_id: row.request_id,
          offer_id: offerId,
          planner_id: row.planner_id,
          planner_name: plannerName,
          price: row.price,
        },
      },
    }],
    web: [],
  };
}

// New message → notify the recipient (not the sender). Sender is either the
// customer (recipient is the planner, delivered via Web Push) or the planner
// (recipient is the customer, delivered via Expo — the existing path).
async function newMessageMessages(supabase: SupabaseClient, messageId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('messages')
    .select('sender_id, planner_id, body, request_id, requests(customer_id)')
    .eq('id', messageId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    sender_id: string;
    planner_id: string;
    body: string;
    request_id: string;
    requests: { customer_id: string } | null;
  };

  const customerId = row.requests?.customer_id;
  if (!customerId) return EMPTY;
  const preview = row.body.slice(0, 80);

  if (row.sender_id === customerId) {
    // Customer sent the message → notify the planner via Web Push.
    const { data: plannerProfile } = await supabase
      .from('profiles')
      .select('web_push_subscription, language')
      .eq('id', row.planner_id)
      .single();

    const subscription = plannerProfile?.web_push_subscription as unknown as WebPushSubscription | null;
    if (!subscription) return EMPTY;

    const ar = plannerProfile?.language === 'ar';

    return {
      expo: [],
      web: [{
        subscription,
        payload: {
          title: ar ? 'رسالة جديدة 💬' : 'New message 💬',
          body: preview,
        },
      }],
    };
  }

  // Planner sent the message → notify the customer via Expo (existing path).
  const { data: profile } = await supabase
    .from('profiles')
    .select('expo_push_token, language')
    .eq('id', customerId)
    .single();

  const token = profile?.expo_push_token;
  if (!token) return EMPTY;

  const { data: plannerRow } = await supabase
    .from('planners')
    .select('business_name, profiles(avatar_seed)')
    .eq('user_id', row.planner_id)
    .single();

  const plannerRowTyped = plannerRow as unknown as {
    business_name: string;
    profiles: { avatar_seed: number } | null;
  } | null;

  const ar = profile?.language === 'ar';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'رسالة جديدة 💬' : 'New message 💬',
      body: preview,
      data: {
        type: 'message',
        payload: {
          request_id: row.request_id,
          message_id: messageId,
          planner_id: row.planner_id,
          planner_name: plannerRowTyped?.business_name ?? '',
          planner_seed: plannerRowTyped?.profiles?.avatar_seed ?? 0,
          preview,
        },
      },
    }],
    web: [],
  };
}

// Planner countersigned → notify customer they can pay
async function countersignedMessages(supabase: SupabaseClient, offerId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('offers')
    .select('request_id, planner_id, price, planners(business_name), requests(customer_id, profiles(expo_push_token, language))')
    .eq('id', offerId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    request_id: string;
    planner_id: string;
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { expo_push_token: string | null; language: string } | null;
    } | null;
  };

  const token = row.requests?.profiles?.expo_push_token;
  if (!token) return EMPTY;

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'وقّع المنظّم ✍️' : 'Agreement signed ✍️',
      body: ar
        ? `${plannerName} وقّع على الاتفاقية. يمكنك الآن دفع العربون.`
        : `${plannerName} countersigned. You can now pay your deposit.`,
      data: {
        type: 'offer_accepted',
        payload: {
          request_id: row.request_id,
          offer_id: offerId,
          planner_id: row.planner_id,
          planner_name: plannerName,
        },
      },
    }],
    web: [],
  };
}

// Booking confirmed → notify customer
async function bookingConfirmedMessages(supabase: SupabaseClient, bookingId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('bookings')
    .select('event_date, contracts(offers(request_id, planner_id, planners(business_name), requests(customer_id, profiles(expo_push_token, language))))')
    .eq('id', bookingId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    event_date: string;
    contracts: {
      offers: {
        request_id: string;
        planner_id: string;
        planners: { business_name: string } | null;
        requests: {
          customer_id: string;
          profiles: { expo_push_token: string | null; language: string } | null;
        } | null;
      } | null;
    } | null;
  };

  const offer = row.contracts?.offers;
  const token = offer?.requests?.profiles?.expo_push_token;
  if (!token) return EMPTY;

  const ar = offer?.requests?.profiles?.language === 'ar';
  const plannerName = offer?.planners?.business_name ?? '';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'تم الحجز! 🎉' : 'Booking confirmed! 🎉',
      body: ar
        ? `حجزك مع ${plannerName} مؤكّد. تحقق من تفاصيل فعاليتك.`
        : `Your booking with ${plannerName} is confirmed. Check your event details.`,
      data: {
        type: 'booking_confirmed',
        payload: {
          booking_id: bookingId,
          request_id: offer?.request_id,
          planner_id: offer?.planner_id,
          planner_name: plannerName,
        },
      },
    }],
    web: [],
  };
}
```

- [ ] **Step 2: Deploy the function**

```bash
supabase functions deploy send-push
```

Expected: deploy succeeds. This is the first real test of whether `npm:web-push@3` resolves correctly in the Supabase Edge Runtime (Deno 2, per `supabase/config.toml`'s `edge_runtime.deno_version = 2`) — flagged in the design spec as unverified territory since every other function in this project only uses `esm.sh` imports. If the deploy fails specifically on resolving `npm:web-push@3`, fall back to `https://esm.sh/web-push@3` as the import source instead (same API) and redeploy.

- [ ] **Step 3: Smoke-test each event type**

With a real customer and planner test account (customer has a valid `expo_push_token`, planner has opted into Web Push via Task 5's toggle), trigger each event and confirm delivery:

- Post a request and submit an offer against it → customer's app receives a "New offer" push.
- Planner sends a chat message → customer's app receives a "New message" push.
- Customer sends a chat message → planner's browser receives a "New message" push (with the messages tab *not* focused — confirm it's suppressed when the tab *is* focused, per Task 3's service worker logic).
- Planner countersigns a contract → customer's app receives an "Agreement signed" push.
- Customer pays a deposit (booking created) → customer's app receives a "Booking confirmed" push.

For each, also check the edge function logs:

```bash
supabase functions logs send-push
```

Expected: no errors; the response body for a message event includes either `{"expo": [...]}` or `{"web": [...]}` depending on direction, matching which channel was exercised.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/send-push/index.ts
git commit -m "Add Web Push channel to send-push; unify data payload shape with in-app notifications"
```

---

## Task 9: End-to-end verification checklist

**Files:** none (verification only)

- [ ] **Step 1: Full customer→planner chat push loop**

As a planner with notifications enabled (Task 5), close the dashboard tab entirely. As a customer, send a chat message to that planner. Confirm an OS-level browser notification appears, and clicking it opens/focuses the planner dashboard on `/messages`.

- [ ] **Step 2: Full planner→customer tap-to-navigate loop**

As a planner, send a chat message to a customer. On the customer's device (background or fully closed app), confirm the push notification arrives, and tapping it opens the app directly into that chat conversation (not just the app's default screen) — verifies both the enriched `data.payload` from Task 8 and the tap handler from Task 7 together.

- [ ] **Step 3: Regression check — existing customer notifications unaffected**

Confirm the three other event types (new offer, countersigned, booking confirmed) still deliver to the customer exactly as before, and that tapping each now also navigates correctly (this is new behavior from Task 7, layered on the pre-existing delivery from Task 8) — new offer → offers/proposals screen, countersigned → checkout, booking confirmed → the booking detail screen.

- [ ] **Step 4: Regression check — planner in-app notifications unaffected**

Confirm the planner's in-app bell (`NotificationsPanel.tsx`) still shows new-message notifications in realtime regardless of the Web Push toggle state — that path (the `notifications` table + `notify_planner_new_message` trigger) is untouched by this work and should keep working independently.

- [ ] **Step 5: Toggle off and confirm silence**

As a planner, turn the notifications toggle off (Task 5). Have a customer send another message. Confirm no browser push arrives (the in-app bell should still update, per Step 4 — only the OS-level push should stop).
