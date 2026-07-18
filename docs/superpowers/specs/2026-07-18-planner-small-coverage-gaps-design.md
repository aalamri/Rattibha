# Test coverage for apps/planner's Button, proxy.ts, and eventDateFor — design

Date: 2026-07-18

## Problem

A coverage check of `apps/planner` (after its `lib/` + `components/ui/` test pass) found three small, cheap gaps left untested: `components/ui/Button.tsx` (the one sibling the prior `ui/` pass missed — it doesn't even appear in the coverage report), `src/proxy.ts` (Next.js middleware, but functionally a small pure-ish function), and `src/data/requests.ts`'s `eventDateFor` (one small pure function; the rest of that file is static mock data, not logic).

## Scope

In scope:
- `src/components/ui/Button.tsx` — full component test, same shape as its 8 already-tested `components/ui/` siblings.
- `src/proxy.ts` — the `proxy(request)` function's three branches (existing cookie / Arabic Accept-Language / non-Arabic Accept-Language).
- `src/data/requests.ts`'s `eventDateFor(request)` — the one function in that file with logic.

Explicitly out of scope:
- `proxy.ts`'s exported `config.matcher` — static declarative config, not behavior.
- `OPEN_REQUESTS` in `requests.ts` — static mock data, not logic.
- Everything else identified in the broader `apps/planner` coverage gap (`lib/AuthContext.tsx`/`portfolioStorage.ts`/`supabase.ts`/`webPush.ts`, `components/layout/`, `app/onboarding/_components/`, `theme/ThemeContext.tsx`, `i18n/index.ts`'s partial gap, all `app/**/page.tsx` screens) — separate follow-ups.
- Snapshot testing, visual/screenshot regression testing.

## Design

### 1. `Button.test.tsx`

Follows the exact convention already established by the 8 sibling `components/ui/*.test.tsx` files: `render` from `@testing-library/react`, `getByText`/`getByRole`, `className.toContain(...)` for Tailwind class assertions (`Button.tsx`'s own `VARIANT_CLASSES`/`SIZE_CLASSES` maps, copied from source the same way `Badge.test.tsx` copies `TONE_CLASSES`), `container.querySelectorAll('svg')` for icon presence (confirmed working for `phosphor-react` icons in the earlier `ui/` pass), and `fireEvent.click` for interaction (the pattern `DetailHeader.test.tsx` already established for this app).

Test cases:
- Renders `children` text.
- Default (`variant="primary"`, `size="md"`): applies `VARIANT_CLASSES.primary` and `SIZE_CLASSES.md` class strings.
- A non-default variant/size (e.g. `variant="danger"`, `size="lg"`) applies the corresponding class strings instead.
- `icon` renders an `<svg>` before the children; `iconRight` renders one after; neither renders one when omitted.
- `onClick` fires on click (`fireEvent.click`).
- `disabled` passes through as a native attribute (`button.disabled === true`) and `onClick` does not fire when clicked while disabled (native `<button disabled>` behavior — no component-level guard needed, but worth asserting since it's part of the contract `...rest` spreading provides).

### 2. `proxy.test.ts`

**Environment:** `NextRequest`/`NextResponse` (from `next/server`) require the Web-standard `Request`/`Response`/`Headers` globals, which this project's default Jest environment (`jsdom`, via `jest.config.ts`) does not provide — confirmed empirically: constructing a `NextRequest` under the default config throws `ReferenceError: Request is not defined`. The fix, also confirmed empirically, is a per-file environment override docblock at the very top of the test file:

```ts
/**
 * @jest-environment node
 */
```

Node 22's own global scope provides `Request`/`Response`/`Headers` natively, and `proxy()`'s three branches were confirmed to behave correctly under this override before writing this spec.

Test cases (each constructs a real `NextRequest` with the relevant `headers` init and calls the real `proxy()`):
- No `rtb_lang` cookie, `Accept-Language: ar-SA,ar;q=0.9` → response sets a `rtb_lang=ar` cookie (assert `response.cookies.get('rtb_lang')?.value === 'ar'`, and spot-check `maxAge`/`sameSite` match `proxy.ts`'s literal values: `31536000`/`'lax'`).
- No `rtb_lang` cookie, `Accept-Language: en-US,en;q=0.9` → response sets no `rtb_lang` cookie (passthrough).
- `rtb_lang` cookie already present (any value, e.g. `en`), even with `Accept-Language: ar-SA` → response sets no NEW `rtb_lang` cookie (existing preference always wins, confirmed empirically — the cookie-present branch returns before the header is even read).

### 3. `requests.test.ts`

Colocated with `src/data/requests.ts`. Only tests `eventDateFor` — `OPEN_REQUESTS` itself is out of scope (see above).

`eventDateFor` computes `new Date()` internally (real system clock), so — same reasoning and same fix as `DateSheet.test.tsx` earlier in this project — the clock is pinned for a deterministic result:

```ts
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-18T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});
```

Test cases:
- `eventDateFor({ ...minimalRequest, daysFromNow: 14 })` returns a date exactly 14 days after the pinned "now" (assert `getFullYear()`/`getMonth()`/`getDate()` individually, matching the `DateSheet.test.tsx` precedent, rather than a single `Date` equality check that would also have to account for the time-of-day component `new Date()` carries).
- `daysFromNow: 0` returns a date matching the pinned "now" exactly (boundary case).

A minimal `OpenRequest` fixture (only `daysFromNow` varies per test; the rest of the required fields get fixed placeholder values) is defined inline in the test file — it's a single small interface with no nested objects, so no shared fixture helper is warranted (unlike `apps/customer`'s `makePlanner`, which existed because two separate test files needed the same larger `Planner` shape).

### 4. Verification

- `npm test -- --watchAll=false` (all 3 new files, plus the 10 existing) passes with zero failures.
- `npx tsc --noEmit` and `npm run lint` stay at whatever `apps/planner`'s current baseline is at implementation time (re-confirm exact counts then, the same way every prior task in this project has — do not assume the last-measured numbers still hold).

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement.
- No CI wiring.
- No snapshot tests.
- No testing of `proxy.ts`'s `config.matcher` export.
- No testing of `OPEN_REQUESTS`'s static data.
- No modification of `Button.tsx`, `proxy.ts`, or `requests.ts`.
