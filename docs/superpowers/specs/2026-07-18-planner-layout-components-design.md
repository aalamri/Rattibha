# Test coverage for apps/planner's components/layout/ — design

Date: 2026-07-18

## Problem

`apps/planner`'s `components/layout/` directory (`DashboardShell`, `Topbar`, `Sidebar`, `NotificationsPanel`) has zero test coverage — none of these 4 files appear in the coverage report at all. This is the largest remaining coherent gap in `apps/planner` short of testing screens directly, and the first component work in this project that requires mocking Supabase and `AuthContext`.

## Scope

In scope: all 4 files in `apps/planner/src/components/layout/`:
- `DashboardShell.tsx` — auth-gated shell (loading/redirect logic) wrapping `Sidebar` + `Topbar` + page content.
- `Topbar.tsx` — header bar: menu toggle, title/subtitle, language/appearance toggles, notifications, profile summary, sign-out. Renders `NotificationsPanel` as a child.
- `Sidebar.tsx` — nav list with live Supabase-driven badge counts, admin-only item filtering, mobile drawer.
- `NotificationsPanel.tsx` — bell button + dropdown panel: fetches notifications, subscribes to realtime inserts, mark-as-read, notification-type-specific rendering and routing.

Explicitly out of scope (separate follow-ups):
- `lib/AuthContext.tsx`'s own `AuthProvider` behavior (the real Supabase-backed session/profile/planner fetching) — these tests mock `useAuth()` entirely rather than exercising the real provider.
- `lib/supabase.ts`, `lib/portfolioStorage.ts`, `lib/webPush.ts`.
- `app/onboarding/_components/` and all `app/**/page.tsx` screens.
- Realtime event handling itself (simulating an actual `postgres_changes` INSERT payload arriving) — only that the channel is subscribed to and cleaned up on unmount.
- Snapshot testing, visual/screenshot regression testing.

## Design

### 1. Two empirically-verified facts that shape everything below

**`@/lib/supabase` cannot be imported unmocked under Jest.** `supabase.ts` calls `createClient(url, anonKey)` with `process.env.NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` — these live in `.env.local`, which this project's Jest setup does not load, so the real module throws `Error: supabaseUrl is required` on import. Confirmed directly: `require('./lib/supabase')` under Jest throws this exact error. `Sidebar.tsx` and `NotificationsPanel.tsx` both `import { supabase } from '@/lib/supabase'` directly (not through `AuthContext`), so **every one of the 4 layout components' tests needs this mocked** — including `DashboardShell.test.tsx` and `Topbar.test.tsx`, which don't call Supabase themselves but transitively render children (`Sidebar`, `NotificationsPanel`) that do.

**React double-invokes these effects under this test environment.** Confirmed empirically: rendering `Sidebar` with a mocked session, `supabase.from()` call counts came back doubled (`requests`: 2 calls, `offers`: 4 calls, `messages`: 2 calls — each exactly 2× the single real invocation the component logic implies). A mock keyed by call order or call count breaks under this (a second effect run consumes mock entries meant for the first, or exhausts them). The mock design below resolves each call by inspecting what was actually chained onto it, making it correct regardless of how many times the effect fires.

### 2. Shared test infrastructure — additions to `apps/planner/src/test-utils.tsx`

Add, near the top of the file (before the existing `renderWithI18n`):

```tsx
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  },
}));
```

This is registered once, in `test-utils.tsx`'s own module body — confirmed empirically that any test file which imports `renderWithI18n` from `@/test-utils` (even if that's its only import from the module) gets this mock applied to its entire module graph for that test file's run, including child components imported by the component under test. No test file needs its own `jest.mock('@/lib/supabase', ...)` call.

Also export a shared helper, `mockSupabaseFrom`, for configuring per-test responses:

```tsx
/**
 * Configures the shared supabase.from() mock (see the jest.mock above).
 * Each call to `.from(table)` gets its own fresh chainable query builder;
 * `resolvers[table]` receives the list of chained calls actually made on
 * that specific builder (e.g. [{method: 'eq', args: ['status','pending']}])
 * and returns the response to resolve with. Resolving by inspecting the
 * actual chained calls — not by call order or a shared counter — is what
 * makes this robust to React's double-invoked effects (confirmed empirically,
 * see the design doc this plan was scoped from).
 */
export function mockSupabaseFrom(
  resolvers: Record<string, (calls: Array<{ method: string; args: unknown[] }>) => unknown>
) {
  const { supabase } = require('@/lib/supabase');
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const builder: Record<string, unknown> = {};
    ['select', 'eq', 'in', 'order', 'limit', 'update'].forEach((method) => {
      builder[method] = jest.fn((...args: unknown[]) => {
        calls.push({ method, args });
        return builder;
      });
    });
    builder.then = (resolve: (value: unknown) => void) => Promise.resolve(resolvers[table]?.(calls) ?? {}).then(resolve);
    return builder;
  });
}
```

### 3. Per-file `useAuth` and `next/navigation` mocking

Each component test file mocks `@/lib/AuthContext`'s `useAuth` directly (there is no other seam to inject session/profile/planner without going through the real, Supabase-backed `AuthProvider`), following the exact pattern `DetailHeader.test.tsx` already established for `next/navigation`:

```tsx
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ session: /* ... */, profile: /* ... */, planner: /* ... */, loading: false, signOut: jest.fn() }),
}));
```

`next/navigation`'s `useRouter`/`usePathname` are mocked per-file the same way, matching `DetailHeader.test.tsx`.

### 4. Interactions require `fireEvent`, not raw DOM methods

Confirmed empirically: calling `.click()` directly on a DOM node obtained via `container.querySelector(...)` does not reliably propagate through React's effect/state-update batching in this setup (a click that should open `NotificationsPanel`'s panel silently failed to trigger the expected re-render). `fireEvent.click(...)` from `@testing-library/react` — the pattern `DetailHeader.test.tsx` already uses — works correctly. All click interactions in this plan use `fireEvent`.

### 5. Real translated text, not raw i18n keys

`renderWithI18n` initializes the real i18next instance, so rendered notification text is the actual English copy from `en.json` (e.g. "New message from a customer"), not the raw key (`notifications.types.newMessage`). Assertions read the real string from the locale resource file, matching the pattern already established in the `components/ui/` pass (e.g. `Input.test.tsx` reading `en.common.togglePasswordVisibility`).

### 6. Per-component test cases

**`DashboardShell.test.tsx`**
- `loading: true` (from `useAuth`) renders the loading state (`role="status"`), not children.
- `session: null`, not loading → calls `router.replace('/login')`.
- `session` present, `requireAdmin: true`, `profile.is_admin: false` → calls `router.replace('/')`.
- `session` present, `requireAdmin: true`, `profile.is_admin: true` → renders children (no redirect).
- `session` present, `requireAdmin` not set → renders children regardless of `profile.is_admin`.
- Renders `title`/`subtitle` via the real `Topbar`, and `children` inside `<main>`.

**`Topbar.test.tsx`**
- Renders `title` and `subtitle` (and omits `subtitle` when not provided).
- Menu button (`onMenuClick`) fires on click.
- Language toggle: renders the opposite-language label per current `i18n.language`, calls the real `setAppLanguage` on click (same real-side-effect pattern as `apps/customer`'s `LanguageToggle.test.tsx`).
- Appearance toggle: cycles `mode` via `setMode` using the component's own `NEXT_MODE` map (`system→light→dark→system`) — copied from source since it's module-private, same convention as `Badge.tsx`'s `TONE_CLASSES` in the `components/ui/` pass.
- Sign-out button calls the mocked `signOut`.
- Renders the real `NotificationsPanel` (structural presence check only — its own behavior is covered by its own test file).
- Renders `planner.business_name`/city from the mocked `useAuth` return.

**`Sidebar.test.tsx`**
- Renders every `NAV` item's label (real translation keys) when `profile.is_admin` is `false`, and omits both `adminOnly` items (`adminApprovals`, `adminUsers`).
- Renders all `NAV` items including the 2 admin-only ones when `profile.is_admin` is `true`.
- The nav item matching the current `pathname` gets `aria-current="page"`; others don't.
- Badge counts render correctly using `mockSupabaseFrom`, configured per the empirically-verified query shapes: `requests` (open-count), `offers` (called twice — pending-count and request-ids, disambiguated by the `.eq('status','pending')` filter), `messages` (awaiting-reply, computed from the last message sender per request).
- `open` controls the mobile drawer's visibility class; clicking the backdrop or the close button calls `onClose`.

**`NotificationsPanel.test.tsx`**
- Closed by default; clicking the bell button opens the panel.
- Renders each fetched notification's real translated description (using `mockSupabaseFrom`), the empty state when the list is empty, and the loading state before the fetch resolves.
- Unread indicator dot shows only when `unreadCount > 0`; "mark all read" button shows only then and calls the mocked `supabase.from('notifications').update(...)` chain.
- Clicking a notification closes the panel, marks it read (if unread), and calls the mocked `router.push` with the URL `notificationHref` computes for that notification's `type`.
- On unmount, `supabase.removeChannel` is called (cleanup) — asserted via the shared mock's `removeChannel` jest.fn().

### 7. Verification

- `npm test -- --watchAll=false` (all 4 new files, plus the 13 existing) passes with zero failures.
- `npx tsc --noEmit` and `npm run lint` stay at whatever `apps/planner`'s baseline is at implementation time (re-confirm exact counts then, not assumed from this spec).

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement.
- No CI wiring.
- No snapshot tests.
- No testing of the real `AuthProvider`'s Supabase-backed session/profile-fetching logic.
- No simulating an actual realtime `postgres_changes` payload arriving mid-test — only that the channel subscribes/unsubscribes correctly.
- No modification of `DashboardShell.tsx`, `Topbar.tsx`, `Sidebar.tsx`, or `NotificationsPanel.tsx`.
