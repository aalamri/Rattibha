# Test coverage for apps/planner lib/ and components/ui/ — design

Date: 2026-07-17

## Problem

`apps/planner` (Next.js 16 App Router, React 19 — the planner-side dashboard) has zero test
infrastructure and zero test coverage today, unlike `apps/customer`, which now has full unit-test
coverage for its pure-logic `lib/` modules and its `components/ui/` presentational components. This
is the first slice of the same push applied to `apps/planner`.

## Scope

In scope:
- Pure-logic modules in `apps/planner/src/lib/`: `dealStateMachine.ts`, `format.ts`.
- The 9 presentational components in `apps/planner/src/components/ui/`: `Avatar`, `Badge`, `Card`,
  `DetailHeader`, `EmptyState`, `InfoRow`, `Section`, `Skeleton` (+ `SkeletonCard`).

Explicitly out of scope (separate follow-ups):
- `src/components/layout/` (`DashboardShell`, `NotificationsPanel`, `Sidebar`, `Topbar`) — bigger,
  more integrated components that likely pull in routing/data-fetching beyond this pass's harness.
- `src/lib/AuthContext.tsx`, `portfolioStorage.ts`, `webPush.ts`, `supabase.ts`, `database.types.ts`
  — Supabase-dependent or generated; need their own mocking strategy, not pure-logic testing.
- Everything under `src/app/` (pages, layouts, route handlers).
- Snapshot testing, visual/screenshot regression testing.
- Asserting on resolved CSS/computed colors — JSDOM doesn't compute real stylesheet values, and
  these components are styled via Tailwind classes/CSS custom properties, not JS theme objects (see
  Design §4).

## Design

### 1. Framework setup

`apps/planner` has no test runner installed. Per this exact installed Next.js version's own bundled
docs (`node_modules/next/dist/docs/01-app/02-guides/testing/jest.md` — read directly rather than
assumed from training data, since `AGENTS.md`'s standing rule warns this Next.js version has
diverged from prior knowledge), set up Jest via `next/jest`:

```bash
cd apps/planner
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest
```

Add `apps/planner/jest.config.ts`:

```ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
```

Add `apps/planner/jest.setup.ts`:

```ts
import '@testing-library/jest-dom';
```

Add a `test` script to `apps/planner/package.json`: `"test": "jest"`.

`next/jest` auto-configures the Next.js SWC transform, stylesheet/image mocking, and `.env` loading
— no further Babel/webpack config needed. The `moduleNameMapper` entry mirrors the `@/*` → `./src/*`
path alias already in `tsconfig.json`.

### 2. Test harness

Unlike `apps/customer` (React Native, where every one of the 10 components read `useTheme()` and/or
`useIsRTL()` and needed a blanket `renderWithProviders` wrapper), each of the 9 planner components
was checked directly against its source:

- **8 of 9** (`Avatar`, `Badge`, `Card`, `EmptyState`, `InfoRow`, `Section`, `Skeleton`,
  `SkeletonCard`) are plain prop-driven functions with no hooks — they render correctly with a bare
  `render()` from `@testing-library/react`, no wrapper needed.
- **`DetailHeader`** is the one exception: it calls `useIsRTL()` (`react-i18next`, needs an
  `I18nextProvider` ancestor) and `useRouter()` (`next/navigation`, throws outside a mounted Next.js
  router).

Add `apps/planner/src/test-utils.tsx`, exporting only what `DetailHeader.test.tsx` needs:

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
 * render() instead (see design doc §2).
 */
export async function renderWithI18n(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

afterEach(async () => {
  await i18n.changeLanguage('en');
});

export { i18n };
```

`ensureI18nInitialized` is synchronous (resources are bundled statically, no async backend) and
idempotent — safe to call once per test. The explicit `await i18n.changeLanguage(lang)` afterward
mirrors the defensive pattern from `apps/customer/src/test-utils.tsx`: don't assume synchronous
resolution of i18next internals even where it appears to resolve immediately. `i18n` is a
module-level singleton shared across the whole Jest run, so `afterEach` resets it to `'en'` to
prevent a language change in one test leaking into the next.

`DetailHeader.test.tsx` additionally mocks `next/navigation` locally (Jest's mock hoisting means
this can't live in the shared helper — each file that needs it must call `jest.mock` at its own top
level):

```tsx
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));
```

### 3. Icon rendering

`components/ui/` icons come from `phosphor-react` (the web package — distinct from
`phosphor-react-native`, which `apps/customer` uses). Confirmed empirically: `phosphor-react` has a
CJS `main` entry and renders icons as literal `<svg>` DOM elements under JSDOM. There is no
host-node-collapsing behavior to work around like the RN app's `TestInstance` tree required — icon
presence is queryable directly, e.g. `container.querySelectorAll('svg')`.

### 4. Styling assertions

These components style themselves via Tailwind utility classes and CSS custom properties (e.g.
`bg-brand`, `var(--color-border)`), not JS theme objects read from a `useTheme()` hook the way
`apps/customer`'s components do. JSDOM does not compute real stylesheet values, so tests in this
pass assert **rendered className strings, DOM structure, conditional rendering, and event-handler
behavior** — never a resolved color/computed style. This is a plain, standard React Testing Library
style of test, without the `StyleSheet.flatten` machinery `apps/customer`'s plan needed.

### 5. Test file placement

Colocated `*.test.ts(x)` next to each source file:

- `src/lib/dealStateMachine.test.ts`
- `src/lib/format.test.ts`
- `src/components/ui/Avatar.test.tsx`
- `src/components/ui/Badge.test.tsx`
- `src/components/ui/Card.test.tsx`
- `src/components/ui/DetailHeader.test.tsx`
- `src/components/ui/EmptyState.test.tsx`
- `src/components/ui/InfoRow.test.tsx`
- `src/components/ui/Section.test.tsx`
- `src/components/ui/Skeleton.test.tsx` (covers both `Skeleton` and `SkeletonCard`)

### 6. Test case outline

**`dealStateMachine.test.ts`**
- `canTransition`: valid forward transitions per the `TRANSITIONS` table; invalid transitions
  rejected; any non-terminal status can transition to `cancelled`; terminal statuses
  (`declined`/`cancelled`/`reviewed`) cannot transition to `cancelled` again.
- `isTerminal`: true for `declined`/`cancelled`/`reviewed`, false otherwise.
- `nextExpected`: returns the first entry in the transitions table for a given status, `null` for
  terminal statuses.

**`format.test.ts`**
- `formatNumber`: Western digits for `en`, Arabic-Indic digits for `ar`.
- `formatDate`: `en` uses `'en-GB'`; `ar` uses `'ar-SA-u-ca-gregory'` (forced Gregorian, not Hijri).
  **Known pitfall, already hit once in `apps/customer/src/lib/format.test.ts`
  (commit `823fecd`):** an output-equality assertion alone (`formatDate(date, 'ar', options)` equals
  some expected string) does NOT catch a regression back to plain `'ar-SA'` — Node's bundled ICU
  already defaults `'ar-SA'` to the Gregorian calendar, so `'ar-SA'` and `'ar-SA-u-ca-gregory'`
  produce byte-identical output in this Jest/Node environment (the Hijri-default behavior
  `format.ts`'s own comment describes is iOS-ICU-specific, not exercised here). The actual regression
  guard needs a `jest.spyOn(globalThis.Intl, 'DateTimeFormat')` assertion inspecting the exact locale
  string `formatDate` passes through, mirroring the customer app's fix. Note planner's `formatDate`
  signature takes `lang: string` directly (`'en' | 'ar'`), not the customer app's `isRTL: boolean` —
  adjust call sites accordingly, don't copy the customer test verbatim.

**`Card.test.tsx`**
- Renders `children`.
- `pad` controls padding style; default value applies when omitted.
- Passes through arbitrary DOM props (`...rest`, e.g. `data-testid`) and merges a caller-supplied
  `style` object rather than overwriting it.

**`Skeleton.test.tsx`**
- `Skeleton`: renders with the given `width`/`height`; a placeholder `animate-pulse` class is
  present.
- `SkeletonCard`: renders `children` inside its container.

**`Avatar.test.tsx`**
- Renders `initials` as visible text.
- `seed` selects `GRADIENTS[seed % GRADIENTS.length]` — assert the element's inline `background`
  style matches the expected gradient string, including the modulo-wraparound case.
- `size` controls width/height/font-size proportionally.
- `ring` toggles the ring class.

**`Badge.test.tsx`**
- Renders `children` text.
- Renders the optional `icon` (as an `<svg>`) when provided, omits it when not.
- `tone` and `solid` together select the correct class combination (spot-check a couple of
  tone/solid pairings, not the full cross-product).

**`Section.test.tsx`**
- Renders `children` inside a `Card`.
- Renders `title` and/or `action` only when provided; renders neither wrapper row when both are
  omitted.

**`EmptyState.test.tsx`**
- Always renders the icon and `title`.
- Renders `subtitle` only when provided.
- Renders `children` only when provided.

**`InfoRow.test.tsx`**
- Renders `icon`, `label`, and `value`.
- `last` omits the bottom border class; omitted/false keeps it.

**`DetailHeader.test.tsx`**
- Renders `crumb` and `children` (action slot).
- Clicking the back button calls the provided `onBack` when set.
- Clicking the back button calls `router.back()` when `onBack` is not provided (via the
  `next/navigation` mock).
- RTL: the back-arrow icon gets the `rotate-180` class; LTR: it does not.

## Testing

This design's own subject matter is testing, so "testing the tests" isn't applicable beyond the
standard bar: every new test file's suite passes, `npx tsc --noEmit` stays at whatever baseline
exists before this work starts (captured at plan-writing time), and `npm run lint` introduces no new
findings in the changed files.
