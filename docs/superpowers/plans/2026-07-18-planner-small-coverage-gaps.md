# Test coverage for apps/planner's Button, proxy.ts, and eventDateFor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for the three remaining small, cheap gaps in `apps/planner`'s already-covered layers: `components/ui/Button.tsx` (the one `ui/` sibling the prior pass missed), `src/proxy.ts` (Next.js middleware — functionally a small pure-ish function), and `src/data/requests.ts`'s `eventDateFor` (the one function with logic in that file).

**Architecture:** All three are small, standalone additions with no shared fixture needed between them. `Button.test.tsx` follows the exact convention already established by its 8 already-tested `components/ui/` siblings. `proxy.test.ts` needs a per-file `@jest-environment node` override (confirmed necessary and sufficient — the default `jsdom` environment lacks the Web-standard `Request`/`Response` globals `next/server`'s `NextRequest` needs). `requests.test.ts` pins the system clock the same way `DateSheet.test.tsx` did earlier in this project, since `eventDateFor` reads the real clock internally.

**Tech Stack:** `jest` + `next/jest` (already configured), `@testing-library/react` (already installed), no new dependencies.

## Global Constraints

- **Baseline before this work starts:** `npx tsc --noEmit` in `apps/planner` → **0 errors**. `npm run lint` → **8 problems (7 errors, 1 warning)**, confined to `src/app/offers/[id]/page.tsx`, `src/app/offers/page.tsx`, `src/app/open-requests/[id]/quote/page.tsx`, `src/lib/AuthContext.tsx`, `src/theme/ThemeContext.tsx`. **None of these pre-existing findings are in `Button.tsx`, `proxy.ts`, or `requests.ts`** — every task below must keep both counts exactly at this baseline for the files it touches.
- **`NextRequest`/`NextResponse` (from `next/server`) do not work under this project's default Jest environment (`jsdom`, set in `jest.config.ts`)** — confirmed empirically: constructing a `NextRequest` under the default config throws `ReferenceError: Request is not defined`, because `jsdom` doesn't provide the Web-standard `Request`/`Response`/`Headers` globals `next/server` builds on. The fix, also confirmed empirically, is a per-file environment override docblock at the very top of `proxy.test.ts`:
  ```ts
  /**
   * @jest-environment node
   */
  ```
  Node 22's own global scope provides `Request`/`Response`/`Headers` natively — no polyfill package needed. This override is file-scoped only; it does not change the environment for any other test file.
- **`proxy()`'s cookie-present branch returns before the `Accept-Language` header is even read** — confirmed empirically: with an existing `rtb_lang` cookie, the response never carries a new `rtb_lang` cookie regardless of what `Accept-Language` says. This is why the third `proxy.test.ts` case uses a *conflicting* `Accept-Language: ar-SA` alongside an existing `rtb_lang=en` cookie — it proves the existing cookie wins, not just that "a cookie exists so nothing happens to be re-set."
- **`eventDateFor` (in `src/data/requests.ts`) computes `new Date()` internally (the real system clock), not from any parameter.** Tests must pin the clock via `jest.useFakeTimers()` + `jest.setSystemTime(...)` in a `beforeEach`, restored via `jest.useRealTimers()` in `afterEach` — the same pattern `DateSheet.test.tsx` already established in this project for the same reason.
- No snapshot tests. No assertions on resolved/computed CSS values — only rendered `className` strings (`Button.tsx`'s own `VARIANT_CLASSES`/`SIZE_CLASSES` maps, copied from source the same way `Badge.test.tsx` copies `TONE_CLASSES` — module-private, not exported), DOM structure, and behavior.
- No modification of `Button.tsx`, `proxy.ts`, or `requests.ts`.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the baseline above, `npm run lint` introducing no new findings on the changed files, and a commit.

---

## Task 1: `Button.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: `Button` from `./Button` (already implemented, do not modify). `Calendar` icon from `phosphor-react` (a real, existing export — confirmed, and already used this way in the earlier `Badge.test.tsx`/`EmptyState.test.tsx` in this same suite).

- [ ] **Step 1: Write `Button.test.tsx`**

Create `apps/planner/src/components/ui/Button.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { Button } from './Button';

describe('Button', () => {
  test('renders the children text', () => {
    const { getByText } = render(<Button>Save</Button>);
    expect(getByText('Save')).toBeInTheDocument();
  });

  test('defaults to primary variant and md size classes', () => {
    const { getByText } = render(<Button>Save</Button>);
    const className = getByText('Save').className;
    expect(className).toContain('bg-brand text-white shadow-brand hover:bg-brand-hover active:bg-brand-press');
    expect(className).toContain('gap-2 px-[17px] py-2.5 text-[14.5px]');
  });

  test('a non-default variant/size applies the corresponding classes', () => {
    const { getByText } = render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    const className = getByText('Delete').className;
    expect(className).toContain('border-transparent bg-danger-bg text-danger hover:brightness-95');
    expect(className).toContain('gap-2 px-[22px] py-[13px] text-[15px]');
  });

  test('icon renders before children, iconRight renders after; neither renders when omitted', () => {
    const { container: withIcon } = render(<Button icon={Calendar}>Save</Button>);
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withIconRight } = render(<Button iconRight={Calendar}>Save</Button>);
    expect(withIconRight.querySelectorAll('svg')).toHaveLength(1);

    const { container: withNeither } = render(<Button>Save</Button>);
    expect(withNeither.querySelectorAll('svg')).toHaveLength(0);
  });

  test('onClick fires on click', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(getByText('Save'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled passes through natively and blocks the click', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    );
    const button = getByText('Save') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Button.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: 0 errors (matches baseline).

Run: `cd apps/planner && npm run lint`
Expected: 8 problems (7 errors, 1 warning), same 5 files as the Global Constraints baseline — nothing new in `Button.test.tsx`.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Button.test.tsx
git commit -m "Add Button unit tests"
```

---

## Task 2: `proxy.test.ts`

**Files:**
- Create: `apps/planner/src/proxy.test.ts`

**Interfaces:**
- Consumes: `proxy` from `./proxy` (already implemented, do not modify). `NextRequest` from `next/server`.

- [ ] **Step 1: Write `proxy.test.ts`**

Create `apps/planner/src/proxy.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { proxy } from './proxy';

describe('proxy', () => {
  test('no rtb_lang cookie, Arabic Accept-Language: sets rtb_lang=ar', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { 'accept-language': 'ar-SA,ar;q=0.9' },
    });
    const response = proxy(request);
    const cookie = response.cookies.get('rtb_lang');
    expect(cookie?.value).toBe('ar');
    expect(cookie?.maxAge).toBe(31536000);
    expect(cookie?.sameSite).toBe('lax');
  });

  test('no rtb_lang cookie, non-Arabic Accept-Language: passthrough, no cookie set', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { 'accept-language': 'en-US,en;q=0.9' },
    });
    const response = proxy(request);
    expect(response.cookies.get('rtb_lang')).toBeUndefined();
  });

  test('rtb_lang cookie already present: passthrough regardless of Accept-Language', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { cookie: 'rtb_lang=en', 'accept-language': 'ar-SA' },
    });
    const response = proxy(request);
    expect(response.cookies.get('rtb_lang')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false proxy.test`
Expected: all 3 tests pass, 0 failures.

If the first test fails with `ReferenceError: Request is not defined`, the `@jest-environment node` docblock at the top of the file is missing or malformed — it must be the very first thing in the file (before any `import`), exactly as shown above.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/proxy.test.ts
git commit -m "Add proxy.ts unit tests"
```

---

## Task 3: `requests.test.ts`

**Files:**
- Create: `apps/planner/src/data/requests.test.ts`

**Interfaces:**
- Consumes: `eventDateFor`, `OpenRequest` from `./requests` (already implemented, do not modify).

- [ ] **Step 1: Write `requests.test.ts`**

Create `apps/planner/src/data/requests.test.ts`:

```ts
import { eventDateFor, type OpenRequest } from './requests';

const baseRequest: OpenRequest = {
  id: 'q1',
  name: 'Test',
  initials: 'T',
  seed: 1,
  category: 'weddings',
  guests: 100,
  city: 'riyadh',
  daysFromNow: 0,
  budgetKey: 'under10',
  postedHoursAgo: 0,
  offers: 0,
  match: 0,
  verified: false,
  note: '',
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-18T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('eventDateFor', () => {
  test('returns a date daysFromNow days after the pinned now', () => {
    const result = eventDateFor({ ...baseRequest, daysFromNow: 14 });
    const expected = new Date('2026-07-18T12:00:00Z');
    expected.setDate(expected.getDate() + 14);
    expect(result.getFullYear()).toBe(expected.getFullYear());
    expect(result.getMonth()).toBe(expected.getMonth());
    expect(result.getDate()).toBe(expected.getDate());
  });

  test('daysFromNow: 0 returns a date matching the pinned now exactly', () => {
    const result = eventDateFor({ ...baseRequest, daysFromNow: 0 });
    const now = new Date('2026-07-18T12:00:00Z');
    expect(result.getFullYear()).toBe(now.getFullYear());
    expect(result.getMonth()).toBe(now.getMonth());
    expect(result.getDate()).toBe(now.getDate());
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false requests.test`
Expected: both tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Run the full suite together**

Run: `cd apps/planner && npm test -- --watchAll=false`
Expected: all 13 test files pass (10 existing + 3 from this plan), every test green, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd apps/planner
git add src/data/requests.test.ts
git commit -m "Add eventDateFor unit tests"
```
