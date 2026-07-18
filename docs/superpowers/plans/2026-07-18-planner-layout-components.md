# Test coverage for apps/planner's components/layout/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for all 4 files in `apps/planner/src/components/layout/` (`DashboardShell`, `Topbar`, `Sidebar`, `NotificationsPanel`) — currently at zero coverage, and the first component work in this project requiring Supabase and `AuthContext` mocking.

**Architecture:** New shared test infrastructure in `apps/planner/src/test-utils.tsx` (a global `@/lib/supabase` mock plus a `mockSupabaseFrom` configurable resolver, and a new `renderWithProviders` helper wrapping both `I18nextProvider` and the real `ThemeProvider`), plus one addition to `jest.setup.ts` (a `window.matchMedia` polyfill). Every task also mocks `@/lib/AuthContext` and `next/navigation` per-file, following the `next/navigation` pattern `DetailHeader.test.tsx` already established.

**Tech Stack:** `jest` + `next/jest` (already configured), `@testing-library/react` (already installed), no new dependencies.

## Global Constraints

- **Baseline before this work starts:** `npx tsc --noEmit` in `apps/planner` → **0 errors**. `npm run lint` → **8 problems (7 errors, 1 warning)**, confined to `src/app/offers/[id]/page.tsx`, `src/app/offers/page.tsx`, `src/app/open-requests/[id]/quote/page.tsx`, `src/lib/AuthContext.tsx`, `src/theme/ThemeContext.tsx`. Every task below must keep both counts exactly at this baseline for the files it touches.
- **`@/lib/supabase` cannot be imported unmocked under Jest.** `supabase.ts` calls `createClient(url, anonKey)` with env vars (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`) that live in `.env.local`, which this project's Jest setup does not load — confirmed empirically: `require('./lib/supabase')` under Jest throws `Error: supabaseUrl is required`. `Sidebar.tsx` and `NotificationsPanel.tsx` both `import { supabase } from '@/lib/supabase'` directly. Task 1 fixes this globally via `jest.mock('@/lib/supabase', ...)` in `test-utils.tsx` — confirmed empirically (same mechanism already proven for `renderWithI18n`) that this propagates to any test file that imports anything from `@/test-utils`, including through child components (e.g. `Topbar` rendering the real `NotificationsPanel`).
- **React double-invokes these components' data-fetching effects under this test environment.** Confirmed empirically: rendering `Sidebar` with a mocked session, `supabase.from()` call counts came back exactly double what the component logic implies (`requests`: 2 calls, `offers`: 4 calls, `messages`: 2 calls). A mock resolved by call order or count breaks under this. Task 1's `mockSupabaseFrom` resolves each call by inspecting what was actually chained onto that specific query builder (e.g. whether `.eq('status','pending')` was called), which is correct regardless of how many times the effect fires — do not replace this with a simpler call-order-based mock.
- **`window.matchMedia` is not implemented by jsdom.** `ThemeContext.tsx`'s `ThemeProvider` calls it unconditionally on mount (system-scheme detection) — confirmed empirically: rendering the real `ThemeProvider` under jsdom without a polyfill throws `window.matchMedia is not a function`. Task 1 adds a polyfill to `jest.setup.ts`, **guarded with `typeof window !== 'undefined'`** since this file also runs for `apps/planner/src/proxy.test.ts`, which uses `@jest-environment node` (no `window` global at all) — confirmed empirically that an unguarded polyfill breaks that file.
- **The mocked `useAuth()` return value MUST be a referentially-stable object — not a fresh literal created inside the mock factory on every call.** This is the most important constraint in this plan. `Sidebar.tsx` and `NotificationsPanel.tsx` both have `useEffect(() => {...}, [session])`. Confirmed empirically, the hard way: `jest.mock('@/lib/AuthContext', () => ({ useAuth: () => ({ session: {...}, ... }) }))` — a fresh object literal returned on every call — creates an infinite render loop (the effect "sees" a new `session` reference on every render, re-runs, calls `setState`, triggers a re-render, gets a new `session` reference again, forever) that **crashes Jest with a JavaScript heap out-of-memory error**, not a test failure. Every task's `useAuth` mock either returns a `const` object defined once outside the mock factory, or (when a test needs to vary auth state) a `let`-bound variable reassigned between tests but never recreated mid-test — see each task's exact code below.
- **Interactions must use `fireEvent`, not raw DOM `.click()`.** Confirmed empirically: calling `.click()` directly on a queried DOM node did not reliably propagate through this setup's React batching (a click that should have opened `NotificationsPanel` silently failed). `fireEvent.click(...)` — the pattern `DetailHeader.test.tsx` already uses — works correctly.
- **Assertions read real translated English text from `en.json`, not raw i18n keys.** `renderWithI18n`/`renderWithProviders` initialize the real i18next instance, so e.g. a `new_message` notification renders as "New message from a customer", not the key `notifications.types.newMessage`.
- **A benign React `act()` console warning is expected and accepted, not a defect, in `DashboardShell.test.tsx`, `Topbar.test.tsx`, and some `Sidebar.test.tsx` cases.** These tests render the real `Sidebar`/`NotificationsPanel` as children; those children's own background data-fetching effects sometimes settle on a later microtask than the test's own assertions, after `flushEffects()` (see below) has already run its course. This does not indicate incorrect behavior — the tests that specifically exercise that data (in `Sidebar.test.tsx`'s badge-count test and every case in `NotificationsPanel.test.tsx`) properly `await waitFor(...)` on it and show no such warning. Do not attempt to eliminate every instance of this warning; it is a known, harmless quirk of testing a component that renders other stateful children.
- No snapshot tests. No assertions on resolved/computed CSS values.
- No modification of `DashboardShell.tsx`, `Topbar.tsx`, `Sidebar.tsx`, or `NotificationsPanel.tsx`.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the baseline above, `npm run lint` introducing no new findings on the changed files, and a commit.

---

## Task 1: Shared test infrastructure + `DashboardShell.test.tsx`

**Files:**
- Modify: `apps/planner/jest.setup.ts` (add the `matchMedia` polyfill)
- Modify: `apps/planner/src/test-utils.tsx` (add the `@/lib/supabase` mock, `mockSupabaseFrom`, and `renderWithProviders`)
- Create: `apps/planner/src/components/layout/DashboardShell.test.tsx`

**Interfaces:**
- Produces: `mockSupabaseFrom(resolvers?)` and `renderWithProviders(ui, {lang}?)` from `@/test-utils` — Tasks 2, 3, and 4 all consume these exact names and signatures.
- Consumes: `DashboardShell` from `./DashboardShell` (already implemented, do not modify).

- [ ] **Step 1: Add the `matchMedia` polyfill to `jest.setup.ts`**

Open `apps/planner/jest.setup.ts`. It currently contains only:

```ts
import '@testing-library/jest-dom';
```

Replace its full contents with:

```ts
import '@testing-library/jest-dom';

// jsdom does not implement matchMedia — ThemeContext.tsx's ThemeProvider
// calls it unconditionally on mount (system-scheme detection), so any test
// rendering the real ThemeProvider throws without this polyfill. Guarded
// since this file also runs for @jest-environment node test files (e.g.
// proxy.test.ts), where `window` doesn't exist at all.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
```

- [ ] **Step 2: Add the shared Supabase mock, `mockSupabaseFrom`, and `renderWithProviders` to `test-utils.tsx`**

Open `apps/planner/src/test-utils.tsx`. It currently reads:

```tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { ensureI18nInitialized, type AppLanguage } from '@/i18n';

/**
 * Renders through the app's real I18nextProvider — the same wrapping
 * apps/planner/src/app/layout.tsx uses — so components exercise their
 * actual useIsRTL()/useTranslation() hook chain. Only components that read
 * i18n directly need this; most of components/ui/ doesn't and uses a bare
 * render() instead.
 */
export async function renderWithI18n(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

// i18n is a module-level singleton shared across every test file in the
// run — reset it after each test so a language change in one test/file
// can't leak into the next and produce order-dependent failures.
afterEach(async () => {
  await i18n.changeLanguage('en');
});

export { i18n };
```

Replace its full contents with:

```tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { ensureI18nInitialized, type AppLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  },
}));

/**
 * Configures the shared supabase.from() mock (see the jest.mock above).
 * Each call to `.from(table)` gets its own fresh chainable query builder;
 * `resolvers[table]` receives the list of chained calls actually made on
 * that specific builder (e.g. [{method: 'eq', args: ['status','pending']}])
 * and returns the response to resolve with. Resolving by inspecting the
 * actual chained calls — not by call order or a shared counter — is what
 * makes this robust to React's double-invoked effects in this environment
 * (confirmed empirically: Sidebar's badge-fetching effect fires twice per
 * render here). Tables with no configured resolver default to
 * `{ count: 0, data: [] }`, so components that transitively render
 * Supabase-calling children (e.g. DashboardShell rendering Sidebar) don't
 * need to configure every table just to avoid a crash.
 */
export function mockSupabaseFrom(
  resolvers: Record<string, (calls: Array<{ method: string; args: unknown[] }>) => unknown> = {}
) {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const builder: Record<string, unknown> = {};
    ['select', 'eq', 'in', 'order', 'limit', 'update'].forEach((method) => {
      builder[method] = jest.fn((...args: unknown[]) => {
        calls.push({ method, args });
        return builder;
      });
    });
    builder.then = (resolve: (value: unknown) => void) =>
      Promise.resolve(resolvers[table]?.(calls) ?? { count: 0, data: [] }).then(resolve);
    return builder;
  });
}

/**
 * Renders through the app's real I18nextProvider — the same wrapping
 * apps/planner/src/app/layout.tsx uses — so components exercise their
 * actual useIsRTL()/useTranslation() hook chain. Only components that read
 * i18n directly need this; most of components/ui/ doesn't and uses a bare
 * render() instead.
 */
export async function renderWithI18n(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

/**
 * Same as renderWithI18n, but also wraps the real ThemeProvider — for
 * components/layout/ components that call useThemeMode() (only Topbar, and
 * anything that transitively renders it). Kept separate from renderWithI18n
 * rather than folding ThemeProvider into it, so the 13 existing
 * components/ui/ tests (none of which use useTheme/useThemeMode) are
 * unaffected.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{ui}</ThemeProvider>
    </I18nextProvider>
  );
}

// i18n is a module-level singleton shared across every test file in the
// run — reset it after each test so a language change in one test/file
// can't leak into the next and produce order-dependent failures.
afterEach(async () => {
  await i18n.changeLanguage('en');
});

export { i18n };
```

- [ ] **Step 3: Write `DashboardShell.test.tsx`**

Create `apps/planner/src/components/layout/DashboardShell.test.tsx`:

```tsx
import { act, screen, waitFor } from '@testing-library/react';

import { mockSupabaseFrom, renderWithProviders } from '@/test-utils';
import { DashboardShell } from './DashboardShell';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/',
}));

/**
 * DashboardShell renders the real Sidebar/Topbar/NotificationsPanel, whose
 * own background data-fetching effects settle on a later microtask than
 * this test's main assertion — flushing here avoids an act() warning from
 * those (unrelated-to-this-test) state updates landing after the test ends.
 */
async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

let mockAuth: {
  session: unknown;
  profile: { is_admin: boolean } | null;
  planner: { business_name: string; city: string } | null;
  loading: boolean;
  signOut: jest.Mock;
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('DashboardShell', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSupabaseFrom();
  });

  test('loading: renders the loading status, not children', async () => {
    mockAuth = { session: null, profile: null, planner: null, loading: true, signOut: jest.fn() };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).toBeNull();
  });

  test('no session, not loading: redirects to /login', async () => {
    mockAuth = { session: null, profile: null, planner: null, loading: false, signOut: jest.fn() };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  test('session present, requireAdmin true, non-admin profile: redirects to /', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: null,
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Admin" requireAdmin>
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  test('session present, requireAdmin true, admin profile: renders children, no redirect', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: true },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Admin" requireAdmin>
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    await flushEffects();
  });

  test('session present, requireAdmin not set: renders children regardless of profile.is_admin', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    await flushEffects();
  });

  test('renders title/subtitle via the real Topbar', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Overview" subtitle="All your leads in one place">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(screen.getByText('All your leads in one place')).toBeInTheDocument();
    await flushEffects();
  });
});
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false DashboardShell.test`
Expected: all 6 tests pass, 0 failures. You may see `console.error` output mentioning "not wrapped in act(...)" for `NotificationsPanel` — this is expected (see the Global Constraints note) and does not indicate a failing test.

If the test run hangs or the process crashes with a JavaScript heap out-of-memory error, the mocked `useAuth` is almost certainly returning a fresh object on every call rather than the stable `mockAuth` variable — re-check Step 3's exact code before doing anything else.

- [ ] **Step 5: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: 0 errors (matches baseline).

Run: `cd apps/planner && npm run lint`
Expected: 8 problems (7 errors, 1 warning), same 5 files as the Global Constraints baseline — nothing new in `test-utils.tsx`, `jest.setup.ts`, or `DashboardShell.test.tsx`. (If you see a `no-require-imports` finding in `test-utils.tsx`, you've used `require('@/lib/supabase')` somewhere instead of the top-level `import { supabase } from '@/lib/supabase'` — the Step 2 code above uses the top-level import specifically to avoid this.)

- [ ] **Step 6: Commit**

```bash
cd apps/planner
git add jest.setup.ts src/test-utils.tsx src/components/layout/DashboardShell.test.tsx
git commit -m "Add Supabase/Theme test infra and DashboardShell unit tests"
```

---

## Task 2: `Topbar.test.tsx`

**Files:**
- Create: `apps/planner/src/components/layout/Topbar.test.tsx`

**Interfaces:**
- Consumes: `Topbar` from `./Topbar` (already implemented, do not modify). `mockSupabaseFrom`, `renderWithProviders`, `i18n` from `@/test-utils` (from Task 1, already implemented — do not modify).

- [ ] **Step 1: Write `Topbar.test.tsx`**

Create `apps/planner/src/components/layout/Topbar.test.tsx`:

```tsx
import { act, fireEvent, screen } from '@testing-library/react';

import { i18n, mockSupabaseFrom, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { Topbar } from './Topbar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockSignOut = jest.fn();
// The mocked useAuth() return MUST be a referentially-stable object — Sidebar
// and NotificationsPanel both have useEffect(..., [session]), and a fresh
// object literal on every call makes that dependency "change" on every
// render, causing an infinite effect/render loop (confirmed empirically: an
// inline `() => ({...})` factory here crashed Jest with a heap OOM).
const mockAuthValue = {
  session: { user: { id: 'user-1' } },
  profile: { is_admin: false },
  planner: { business_name: 'Layla Events', city: 'riyadh' },
  loading: false,
  signOut: mockSignOut,
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('Topbar', () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    mockSupabaseFrom();
  });

  test('renders title and subtitle', async () => {
    await renderWithProviders(<Topbar title="Overview" subtitle="All your leads" onMenuClick={() => {}} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('All your leads')).toBeInTheDocument();
    await flushEffects();
  });

  test('omits the subtitle row when not provided', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.queryByText('All your leads')).toBeNull();
    await flushEffects();
  });

  test('menu button fires onMenuClick', async () => {
    const onMenuClick = jest.fn();
    await renderWithProviders(<Topbar title="Overview" onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByLabelText(en.sidebar.openMenu));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('language toggle shows the opposite-language label and switches the real i18n language', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />, { lang: 'en' });
    expect(screen.getByText('العربية')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(en.common.toggleLanguage));
    await act(async () => {
      await Promise.resolve();
    });
    expect(i18n.language).toBe('ar');
    await flushEffects();
  });

  test('sign-out button calls the mocked signOut', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    fireEvent.click(screen.getByLabelText(en.auth.signOut));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('renders planner business_name and city from useAuth', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.getByText('Layla Events')).toBeInTheDocument();
    expect(screen.getByText(en.cities.riyadh)).toBeInTheDocument();
    await flushEffects();
  });

  test('renders the real NotificationsPanel', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.getByLabelText(en.common.notifications)).toBeInTheDocument();
    await flushEffects();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Topbar.test`
Expected: all 7 tests pass, 0 failures. Same accepted `NotificationsPanel` act() warnings as Task 1 may appear.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/layout/Topbar.test.tsx
git commit -m "Add Topbar unit tests"
```

---

## Task 3: `Sidebar.test.tsx`

**Files:**
- Create: `apps/planner/src/components/layout/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `Sidebar` from `./Sidebar` (already implemented, do not modify). `mockSupabaseFrom`, `renderWithI18n` from `@/test-utils`.

- [ ] **Step 1: Write `Sidebar.test.tsx`**

Create `apps/planner/src/components/layout/Sidebar.test.tsx`:

```tsx
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { mockSupabaseFrom, renderWithI18n } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { Sidebar } from './Sidebar';

/**
 * Flushes Sidebar's own badge-fetching effects so their (React-double-
 * invoked) state updates settle before the test ends, avoiding a benign
 * act() warning in tests that aren't asserting on badge values themselves.
 */
async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

jest.mock('next/navigation', () => ({
  usePathname: () => '/open-requests',
}));

// See Topbar.test.tsx for why this object must be referentially stable
// across calls (Sidebar's badge-fetching effect depends on [session]).
const mockAuthValue: { session: unknown; profile: { is_admin: boolean } } = {
  session: { user: { id: 'user-1' } },
  profile: { is_admin: false },
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('Sidebar', () => {
  test('renders non-admin nav items, omits admin-only items, when profile.is_admin is false', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.overview)).toBeInTheDocument();
    expect(screen.getByText(en.nav.openRequests)).toBeInTheDocument();
    expect(screen.queryByText(en.nav.adminApprovals)).toBeNull();
    expect(screen.queryByText(en.nav.adminUsers)).toBeNull();
    await flushEffects();
  });

  test('renders admin-only items too when profile.is_admin is true', async () => {
    mockAuthValue.profile.is_admin = true;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.adminApprovals)).toBeInTheDocument();
    expect(screen.getByText(en.nav.adminUsers)).toBeInTheDocument();
    await flushEffects();
  });

  test('the nav item matching the current pathname gets aria-current="page"', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.openRequests).closest('a')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText(en.nav.overview).closest('a')).not.toHaveAttribute('aria-current');
    await flushEffects();
  });

  test('badge counts resolve correctly from the mocked Supabase queries, robust to effect re-invocation', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom({
      requests: () => ({ count: 5 }),
      offers: (calls) => {
        const isPendingCount = calls.some((c) => c.method === 'eq' && c.args[0] === 'status' && c.args[1] === 'pending');
        return isPendingCount ? { count: 2 } : { data: [{ request_id: 'r1' }] };
      },
      messages: () => ({
        data: [{ request_id: 'r1', sender_id: 'customer-1', created_at: '2026-07-18T00:00:00Z' }],
      }),
    });

    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // browse badge (open requests)
    });
    expect(screen.getByText('2')).toBeInTheDocument(); // leads badge (pending offers)
    expect(screen.getByText('1')).toBeInTheDocument(); // messages badge (1 awaiting reply)
  });

  test('open controls the mobile drawer; the drawer close button calls onClose', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const onClose = jest.fn();
    const { container } = await renderWithI18n(<Sidebar open={true} onClose={onClose} />);

    const aside = container.querySelector('aside')!;
    expect(aside.className).toContain('flex');
    expect(aside.className).not.toContain('hidden');

    // Two elements share this aria-label (the full-screen backdrop button
    // and the drawer's own X button) — scope to the drawer to pick the X.
    fireEvent.click(within(aside).getByLabelText(en.sidebar.closeMenu));
    expect(onClose).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('open: clicking the backdrop also calls onClose', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const onClose = jest.fn();
    const { container } = await renderWithI18n(<Sidebar open={true} onClose={onClose} />);

    const backdrop = container.querySelector('button.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('closed: the drawer is hidden (mobile) and no backdrop renders', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const { container } = await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    const aside = container.querySelector('aside')!;
    expect(aside.className).toContain('hidden');
    expect(container.querySelector('[aria-label="' + en.sidebar.closeMenu + '"].fixed')).toBeNull();
    await flushEffects();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Sidebar.test`
Expected: all 7 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/layout/Sidebar.test.tsx
git commit -m "Add Sidebar unit tests"
```

---

## Task 4: `NotificationsPanel.test.tsx` + final full-suite check

**Files:**
- Create: `apps/planner/src/components/layout/NotificationsPanel.test.tsx`

**Interfaces:**
- Consumes: `NotificationsPanel` from `./NotificationsPanel` (already implemented, do not modify).

- [ ] **Step 1: Write `NotificationsPanel.test.tsx`**

Create `apps/planner/src/components/layout/NotificationsPanel.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockSupabaseFrom, renderWithI18n } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { NotificationsPanel } from './NotificationsPanel';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// See Topbar.test.tsx for why this object must be referentially stable
// across calls (NotificationsPanel's fetch/subscribe effect depends on [session]).
const mockAuthValue = { session: { user: { id: 'user-1' } } };
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('NotificationsPanel', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('closed by default; clicking the bell opens the panel', async () => {
    mockSupabaseFrom();
    await renderWithI18n(<NotificationsPanel />);

    expect(screen.queryByText(en.notifications.title)).toBeNull();
    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.title)).toBeInTheDocument();
    });
  });

  test('renders the empty state when there are no notifications', async () => {
    mockSupabaseFrom({ notifications: () => ({ data: [] }) });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.empty)).toBeInTheDocument();
    });
  });

  test('renders a fetched notification with its real translated description', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: false, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.types.newMessage)).toBeInTheDocument();
    });
  });

  test('unread dot and "mark all read" show only when there are unread notifications', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: false, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.markAllRead)).toBeInTheDocument();
    });
  });

  test('no unread notifications: "mark all read" is not rendered', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: true, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.types.newMessage)).toBeInTheDocument();
    });
    expect(screen.queryByText(en.notifications.markAllRead)).toBeNull();
  });

  test('clicking a notification closes the panel, marks it read, and navigates via notificationHref', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [
          {
            id: 'n1',
            type: 'new_request',
            payload: { request_id: 'req-1', category: 'weddings', city: 'riyadh' },
            read: false,
            created_at: '2026-07-18T00:00:00Z',
          },
        ],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    const expectedText = en.notifications.types.newRequest
      .replace('{{category}}', en.categories.weddings)
      .replace('{{city}}', en.cities.riyadh);
    await waitFor(() => {
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(expectedText).closest('button')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/open-requests/req-1/quote');
    });
    expect(screen.queryByText(en.notifications.title)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false NotificationsPanel.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Run the full suite together**

Run: `cd apps/planner && npm test -- --watchAll=false`
Expected: all 17 test files pass (13 existing + 4 from this plan), every test green, 0 failures. This run should complete in a few seconds — if it hangs or the process is killed for excessive memory use, re-check every `useAuth` mock across all 4 new files for the referentially-stable-object requirement (see Global Constraints).

- [ ] **Step 4: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files — nothing new anywhere in this plan's 4 new test files or the `test-utils.tsx`/`jest.setup.ts` changes.

- [ ] **Step 5: Commit**

```bash
cd apps/planner
git add src/components/layout/NotificationsPanel.test.tsx
git commit -m "Add NotificationsPanel unit tests"
```
