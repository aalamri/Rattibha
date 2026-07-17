# Test coverage for apps/planner lib/ and components/ui/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Jest + React Testing Library to `apps/planner` and write unit tests for its two pure-logic `lib/` modules and its 9 presentational `components/ui/` components — the same coverage push already completed for `apps/customer`, adapted to this app's plain Next.js/Tailwind architecture (no RN `StyleSheet`, no JS theme objects, no host-node-collapsing test tree).

**Architecture:** 8 of the 9 `components/ui/` components are prop-driven functions with no hooks and render correctly with a bare `render()` from `@testing-library/react` — no shared wrapper needed. Only `DetailHeader` reads `useIsRTL()` (react-i18next) and `useRouter()` (`next/navigation`); it gets a small dedicated `src/test-utils.tsx` helper (`renderWithI18n`) plus a file-local `next/navigation` mock, created in the task that needs it rather than upfront.

**Tech Stack:** `jest` + `next/jest` (Next.js's own Jest integration), `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`.

## Global Constraints

The following was verified empirically against the exact installed versions in this repo before writing this plan (`apps/planner/AGENTS.md`'s standing rule: this Next.js version has diverged from training data — installs and config were confirmed live, not assumed) — every task below depends on it:

- **Baseline before this work starts:** `npx tsc --noEmit` in `apps/planner` → **0 errors**. `npm run lint` → **8 problems (7 errors, 1 warning)**, confined to `src/app/offers/[id]/page.tsx`, `src/app/offers/page.tsx`, `src/app/open-requests/[id]/quote/page.tsx`, `src/lib/AuthContext.tsx`, `src/theme/ThemeContext.tsx`. **None of these pre-existing findings are in `src/lib/dealStateMachine.ts`, `src/lib/format.ts`, or any file under `src/components/ui/`** — every task below must keep both counts exactly at this baseline for the files it touches.
- **Jest via `next/jest` works out of the box with this Next.js 16.2.9/React 19 install** — confirmed by running a real test through it. No Babel config, no extra transform config needed.
- **The `@/*` → `./src/*` path alias (from `tsconfig.json`) is NOT auto-resolved by `next/jest`** — `jest.config.ts` needs an explicit `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }` entry, confirmed necessary by testing without it first.
- **`phosphor-react` (the web icon package — distinct from `phosphor-react-native`, which `apps/customer` uses) renders icons as literal `<svg>` DOM elements under JSDOM.** Confirmed by rendering `<Badge icon={Calendar}>` and `<EmptyState icon={Calendar} .../>` and counting `container.querySelectorAll('svg')` — no host-node-collapsing behavior to work around, unlike the RN `TestInstance` tree `apps/customer`'s tests needed. Icon presence is directly queryable this way in every task below that touches an icon prop.
- **Inline `style` objects are read back byte-identical via the DOM element's `.style` property in JSDOM** — confirmed by rendering `<Avatar seed={3} />` and reading `div.style.background`, which returned the exact same gradient string `Avatar.tsx`'s own `GRADIENTS[3]` constant holds. No `StyleSheet.flatten`-style indirection is needed anywhere in this plan (that machinery was specific to React Native).
- **`next/navigation`'s `useRouter` must be mocked per test file** via `jest.mock('next/navigation', () => ({ useRouter: () => ({ back: mockBackFn }) }))` at the top of the file that needs it (Jest's mock hoisting means this cannot live in a shared helper). Confirmed working: clicking `DetailHeader`'s back button called the mocked `back` function exactly once when no `onBack` prop was given, and zero times (with `onBack` itself called once) when `onBack` was provided.
- **`ensureI18nInitialized(lang)` (from `@/i18n`) is synchronous, and a subsequent `i18n.changeLanguage(lang)` is reflected in the very next `render()` call** — confirmed by rendering `<DetailHeader>` after `i18n.changeLanguage('ar')` and observing the `rotate-180` class appear on the back-arrow icon immediately. The shared `renderWithI18n` helper (Task 10) still `await`s `i18n.changeLanguage(lang)` defensively, matching the pattern already proven safe in `apps/customer/src/test-utils.tsx` — don't assume synchronous resolution of i18next internals just because it happened to work in this one manual check.
- **`formatDate`'s locale-string regression risk, already hit once in `apps/customer/src/lib/format.test.ts` (commit `823fecd`):** an output-equality assertion alone does NOT catch a regression from `'ar-SA-u-ca-gregory'` back to plain `'ar-SA'` — Node's bundled ICU already defaults `'ar-SA'` to the Gregorian calendar, so both locale tags produce byte-identical formatted output in this environment. Task 2 below includes a `jest.spyOn(globalThis.Intl, 'DateTimeFormat')` assertion for this reason — do not remove it as "redundant" with the output-equality test.
- `TONE_CLASSES`/`SOLID_TONE_CLASSES` in `Badge.tsx` are module-private (not exported) — Task 6's class-string assertions are copied from `Badge.tsx`'s source rather than imported. If `Badge.tsx`'s class maps change, that test needs a matching update; this is unavoidable, not an oversight.
- No snapshot tests. No assertions on resolved/computed CSS values (JSDOM doesn't compute real stylesheet values) — only rendered `className` strings, inline `style` properties actually set via React's `style` prop, DOM structure, and behavior.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the baseline above, `npm run lint` introducing no new findings on the changed files, and a commit.

## Task 1: Jest + Testing Library setup, `dealStateMachine.test.ts`

**Files:**
- Modify: `apps/planner/package.json`, `apps/planner/package-lock.json` (via install), `apps/planner/package.json` (add `test` script)
- Create: `apps/planner/jest.config.ts`, `apps/planner/jest.setup.ts`
- Create: `apps/planner/src/lib/dealStateMachine.test.ts`

**Interfaces:**
- Produces: a working `npm test` command in `apps/planner`, usable by every later task in this plan.

- [ ] **Step 1: Install Jest and React Testing Library**

```bash
cd apps/planner
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest
```

- [ ] **Step 2: Write the Jest config**

Create `apps/planner/jest.config.ts`:

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

- [ ] **Step 3: Write the Jest setup file**

Create `apps/planner/jest.setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add the test script**

In `apps/planner/package.json`, add to `"scripts"`:

```json
"test": "jest"
```

- [ ] **Step 5: Write `dealStateMachine.test.ts`**

Create `apps/planner/src/lib/dealStateMachine.test.ts`:

```ts
import { canTransition, isTerminal, nextExpected } from './dealStateMachine';

describe('canTransition', () => {
  test('allows each valid forward transition in the table', () => {
    expect(canTransition('request', 'offer_sent')).toBe(true);
    expect(canTransition('offer_sent', 'accepted')).toBe(true);
    expect(canTransition('offer_sent', 'declined')).toBe(true);
    expect(canTransition('accepted', 'countersigned')).toBe(true);
    expect(canTransition('countersigned', 'deposit_paid')).toBe(true);
    expect(canTransition('deposit_paid', 'completed')).toBe(true);
    expect(canTransition('completed', 'reviewed')).toBe(true);
  });

  test('rejects a transition not listed for the current status', () => {
    // request can only go to offer_sent/cancelled, not straight to accepted.
    expect(canTransition('request', 'accepted')).toBe(false);
  });

  test('rejects going backwards', () => {
    expect(canTransition('accepted', 'offer_sent')).toBe(false);
  });

  test('allows cancelling from any non-terminal status, even one not explicitly listed', () => {
    // TRANSITIONS['deposit_paid'] only lists 'completed', not 'cancelled' —
    // the special-case rule in canTransition allows it anyway, since
    // 'deposit_paid' isn't itself a terminal status.
    expect(canTransition('deposit_paid', 'cancelled')).toBe(true);
    expect(canTransition('completed', 'cancelled')).toBe(true);
  });

  test('rejects cancelling from an already-terminal status', () => {
    expect(canTransition('declined', 'cancelled')).toBe(false);
    expect(canTransition('cancelled', 'cancelled')).toBe(false);
    expect(canTransition('reviewed', 'cancelled')).toBe(false);
  });
});

describe('isTerminal', () => {
  test('true for declined, cancelled, and reviewed', () => {
    expect(isTerminal('declined')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('reviewed')).toBe(true);
  });

  test('false for every non-terminal status', () => {
    expect(isTerminal('request')).toBe(false);
    expect(isTerminal('offer_sent')).toBe(false);
    expect(isTerminal('accepted')).toBe(false);
    expect(isTerminal('countersigned')).toBe(false);
    expect(isTerminal('deposit_paid')).toBe(false);
    expect(isTerminal('completed')).toBe(false);
  });
});

describe('nextExpected', () => {
  test('returns the first listed transition for a non-terminal status', () => {
    expect(nextExpected('request')).toBe('offer_sent');
    expect(nextExpected('completed')).toBe('reviewed');
  });

  test('returns null for a terminal status', () => {
    expect(nextExpected('declined')).toBeNull();
    expect(nextExpected('cancelled')).toBeNull();
    expect(nextExpected('reviewed')).toBeNull();
  });
});
```

- [ ] **Step 6: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false dealStateMachine.test`
Expected: all 9 tests pass, 0 failures.

- [ ] **Step 7: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: 0 errors (matches baseline).

Run: `cd apps/planner && npm run lint`
Expected: 8 problems (7 errors, 1 warning), same 5 files as the Global Constraints baseline — nothing new in `dealStateMachine.test.ts`, `jest.config.ts`, or `jest.setup.ts`.

- [ ] **Step 8: Commit**

```bash
cd apps/planner
git add package.json package-lock.json jest.config.ts jest.setup.ts src/lib/dealStateMachine.test.ts
git commit -m "Add Jest setup and dealStateMachine unit tests"
```

---

## Task 2: `format.test.ts`

**Files:**
- Create: `apps/planner/src/lib/format.test.ts`

**Interfaces:**
- Consumes: `formatNumber`, `formatDate` from `./format` (already implemented, do not modify).

- [ ] **Step 1: Write `format.test.ts`**

Create `apps/planner/src/lib/format.test.ts`:

```ts
import { formatDate, formatNumber } from './format';

describe('formatNumber', () => {
  test('renders Western digits for en', () => {
    expect(formatNumber(1234, 'en')).toBe((1234).toLocaleString('en-US'));
  });

  test('renders Arabic-Indic digits for ar', () => {
    const result = formatNumber(1234, 'ar');
    expect(result).toBe((1234).toLocaleString('ar-SA'));
    // Independent of the exact separator/punctuation ICU produces: prove
    // this is genuinely Arabic-Indic digits, not Western digits under a
    // different locale tag.
    expect(result).toMatch(/[٠-٩]/);
    expect(result).not.toMatch(/[0-9]/);
  });
});

describe('formatDate', () => {
  // Noon UTC avoids timezone-boundary date shifting in whatever timezone
  // the test runner happens to execute in.
  const date = new Date('2026-07-17T12:00:00Z');
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  test('en uses en-GB Gregorian formatting', () => {
    expect(formatDate(date, 'en', options)).toBe(new Intl.DateTimeFormat('en-GB', options).format(date));
  });

  // The output-equality assertion below only proves formatDate produces
  // correct Gregorian-formatted Arabic-digit output in this environment. It
  // does NOT by itself catch a revert to plain 'ar-SA': Node's bundled ICU
  // already defaults 'ar-SA' to the Gregorian calendar here, so
  // new Intl.DateTimeFormat('ar-SA', options).format(date) and
  // new Intl.DateTimeFormat('ar-SA-u-ca-gregory', options).format(date)
  // produce byte-identical output. What actually guards against that
  // regression is the spy assertion in the next test.
  test('ar forces the Gregorian calendar rather than defaulting to Hijri', () => {
    const result = formatDate(date, 'ar', options);
    expect(result).toBe(new Intl.DateTimeFormat('ar-SA-u-ca-gregory', options).format(date));
    expect(result).toMatch(/[٠-٩]/);
    expect(result).not.toMatch(/[0-9]/);
  });

  // This is what actually catches a revert to plain 'ar-SA' (or any other
  // drift in the locale tag): it inspects the exact locale argument
  // formatDate passes to the Intl.DateTimeFormat constructor, rather than
  // relying on formatted output that happens to be identical for 'ar-SA'
  // and 'ar-SA-u-ca-gregory' under this environment's ICU.
  test('ar constructs Intl.DateTimeFormat with the exact ar-SA-u-ca-gregory locale tag', () => {
    const spy = jest.spyOn(globalThis.Intl, 'DateTimeFormat');
    try {
      formatDate(date, 'ar', options);
      expect(spy).toHaveBeenCalledWith('ar-SA-u-ca-gregory', options);
    } finally {
      spy.mockRestore();
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false format.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/lib/format.test.ts
git commit -m "Add format.ts unit tests"
```

---

## Task 3: `Card.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Card.test.tsx`

**Interfaces:**
- Consumes: `Card` from `./Card` (already implemented, do not modify).

- [ ] **Step 1: Write `Card.test.tsx`**

Create `apps/planner/src/components/ui/Card.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Card } from './Card';

describe('Card', () => {
  test('renders children', () => {
    const { getByText } = render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(getByText('Card content')).toBeInTheDocument();
  });

  test('defaults pad to 20px', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    expect((container.firstChild as HTMLElement).style.padding).toBe('20px');
  });

  test('pad overrides the default padding', () => {
    const { container } = render(
      <Card pad={8}>
        <p>Content</p>
      </Card>
    );
    expect((container.firstChild as HTMLElement).style.padding).toBe('8px');
  });

  test('merges a caller style object rather than overwriting padding', () => {
    const { container } = render(
      <Card style={{ marginTop: 12 }}>
        <p>Content</p>
      </Card>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.padding).toBe('20px');
    expect(div.style.marginTop).toBe('12px');
  });

  test('passes through arbitrary DOM props', () => {
    const { container } = render(
      <Card data-testid="my-card">
        <p>Content</p>
      </Card>
    );
    expect(container.querySelector('[data-testid="my-card"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Card.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Card.test.tsx
git commit -m "Add Card unit tests"
```

---

## Task 4: `Skeleton.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Skeleton.test.tsx`

**Interfaces:**
- Consumes: `Skeleton`, `SkeletonCard` from `./Skeleton` (already implemented, do not modify).

- [ ] **Step 1: Write `Skeleton.test.tsx`**

Create `apps/planner/src/components/ui/Skeleton.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Skeleton, SkeletonCard } from './Skeleton';

describe('Skeleton', () => {
  test('reflects width/height in style, with the animate-pulse class', () => {
    const { container } = render(<Skeleton width="120px" height="20px" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('120px');
    expect(div.style.height).toBe('20px');
    expect(div.className).toContain('animate-pulse');
  });
});

describe('SkeletonCard', () => {
  test('renders children inside its container', () => {
    const { getByText } = render(
      <SkeletonCard>
        <p>Loading placeholder</p>
      </SkeletonCard>
    );
    expect(getByText('Loading placeholder')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Skeleton.test`
Expected: both tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Skeleton.test.tsx
git commit -m "Add Skeleton/SkeletonCard unit tests"
```

---

## Task 5: `Avatar.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Avatar.test.tsx`

**Interfaces:**
- Consumes: `Avatar`, `GRADIENTS` from `./Avatar` (already implemented, do not modify — `GRADIENTS` is exported, so import it rather than hardcoding the gradient strings).

- [ ] **Step 1: Write `Avatar.test.tsx`**

Create `apps/planner/src/components/ui/Avatar.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Avatar, GRADIENTS } from './Avatar';

describe('Avatar', () => {
  test('renders the given initials', () => {
    const { getByText } = render(<Avatar initials="AB" />);
    expect(getByText('AB')).toBeInTheDocument();
  });

  test('seed selects the matching gradient', () => {
    const { container } = render(<Avatar initials="GH" seed={3} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe(GRADIENTS[3]);
  });

  test('seed wraps around with modulo when it exceeds the gradient count', () => {
    // GRADIENTS has 6 entries (indices 0-5); seed 8 % 6 === 2.
    const { container } = render(<Avatar initials="IJ" seed={8} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe(GRADIENTS[2]);
  });

  test('size controls width, height, and proportional font size', () => {
    const { container } = render(<Avatar initials="KL" size={60} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('60px');
    expect(div.style.height).toBe('60px');
    expect(div.style.fontSize).toBe('22.8px');
  });

  test('ring adds the ring classes; omitting it does not', () => {
    const { container: withRing } = render(<Avatar initials="MN" ring />);
    expect((withRing.firstChild as HTMLElement).className).toContain('ring-2 ring-bg-surface');

    const { container: withoutRing } = render(<Avatar initials="OP" />);
    expect((withoutRing.firstChild as HTMLElement).className).not.toContain('ring-2');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Avatar.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Avatar.test.tsx
git commit -m "Add Avatar unit tests"
```

---

## Task 6: `Badge.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Badge.test.tsx`

**Interfaces:**
- Consumes: `Badge` from `./Badge` (already implemented, do not modify). `Calendar` icon from `phosphor-react` (a real, existing export — confirmed).

- [ ] **Step 1: Write `Badge.test.tsx`**

Create `apps/planner/src/components/ui/Badge.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { Badge } from './Badge';

describe('Badge', () => {
  test('renders the children text', () => {
    const { getByText } = render(<Badge>Featured</Badge>);
    expect(getByText('Featured')).toBeInTheDocument();
  });

  test('renders the icon as an svg when provided', () => {
    const { container } = render(<Badge icon={Calendar}>Top rated</Badge>);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('omits the icon when not provided', () => {
    const { container } = render(<Badge>No icon</Badge>);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  test('defaults to the purple, non-solid tone', () => {
    const { getByText } = render(<Badge>Default</Badge>);
    // TONE_CLASSES/SOLID_TONE_CLASSES are module-private in Badge.tsx (not
    // exported), so this class string is copied from source rather than
    // imported — keep in sync with Badge.tsx if its class maps change.
    expect(getByText('Default').className).toContain('bg-purple-50 text-brand');
  });

  test('solid switches to the solid tone classes', () => {
    const { getByText } = render(
      <Badge tone="green" solid>
        Solid
      </Badge>
    );
    expect(getByText('Solid').className).toContain('bg-emerald-500 text-white');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Badge.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Badge.test.tsx
git commit -m "Add Badge unit tests"
```

---

## Task 7: `Section.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/Section.test.tsx`

**Interfaces:**
- Consumes: `Section` from `./Section` (already implemented, do not modify — it wraps `Card`, already tested in Task 3).

- [ ] **Step 1: Write `Section.test.tsx`**

Create `apps/planner/src/components/ui/Section.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Section } from './Section';

describe('Section', () => {
  test('renders children inside a Card', () => {
    const { getByText } = render(
      <Section>
        <p>Body</p>
      </Section>
    );
    expect(getByText('Body')).toBeInTheDocument();
  });

  test('renders the title when provided', () => {
    const { getByText } = render(
      <Section title="My Title">
        <p>Body</p>
      </Section>
    );
    expect(getByText('My Title')).toBeInTheDocument();
  });

  test('renders the action when provided', () => {
    const { getByText } = render(
      <Section action={<button>Action</button>}>
        <p>Body</p>
      </Section>
    );
    expect(getByText('Action')).toBeInTheDocument();
  });

  test('omits the header row entirely when neither title nor action is provided', () => {
    const { container } = render(
      <Section>
        <p>Body</p>
      </Section>
    );
    expect(container.querySelector('.justify-between')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Section.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/Section.test.tsx
git commit -m "Add Section unit tests"
```

---

## Task 8: `EmptyState.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/EmptyState.test.tsx`

**Interfaces:**
- Consumes: `EmptyState` from `./EmptyState` (already implemented, do not modify). `Calendar` icon from `phosphor-react`.

- [ ] **Step 1: Write `EmptyState.test.tsx`**

Create `apps/planner/src/components/ui/EmptyState.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  test('always renders the icon and title', () => {
    const { getByText, container } = render(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(getByText('No requests yet')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('renders the subtitle only when provided', () => {
    const { queryByText, rerender } = render(
      <EmptyState icon={Calendar} title="No requests yet" subtitle="Post your first request" />
    );
    expect(queryByText('Post your first request')).toBeInTheDocument();

    rerender(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(queryByText('Post your first request')).toBeNull();
  });

  test('renders children only when provided', () => {
    const { getByText, queryByText, rerender } = render(
      <EmptyState icon={Calendar} title="No requests yet">
        <button>Retry</button>
      </EmptyState>
    );
    expect(getByText('Retry')).toBeInTheDocument();

    rerender(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(queryByText('Retry')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false EmptyState.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/EmptyState.test.tsx
git commit -m "Add EmptyState unit tests"
```

---

## Task 9: `InfoRow.test.tsx`

**Files:**
- Create: `apps/planner/src/components/ui/InfoRow.test.tsx`

**Interfaces:**
- Consumes: `InfoRow` from `./InfoRow` (already implemented, do not modify). `Calendar` icon from `phosphor-react`.

- [ ] **Step 1: Write `InfoRow.test.tsx`**

Create `apps/planner/src/components/ui/InfoRow.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { InfoRow } from './InfoRow';

describe('InfoRow', () => {
  test('renders icon, label, and value', () => {
    const { getByText, container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" />);
    expect(getByText('Date')).toBeInTheDocument();
    expect(getByText('July 17')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('renders the bottom border by default', () => {
    const { container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" />);
    expect((container.firstChild as HTMLElement).className).toContain('border-b border-border');
  });

  test('last omits the bottom border', () => {
    const { container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" last />);
    expect((container.firstChild as HTMLElement).className).not.toContain('border-b');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false InfoRow.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/components/ui/InfoRow.test.tsx
git commit -m "Add InfoRow unit tests"
```

---

## Task 10: `src/test-utils.tsx` + `DetailHeader.test.tsx` + final full-suite check

**Files:**
- Create: `apps/planner/src/test-utils.tsx`
- Create: `apps/planner/src/components/ui/DetailHeader.test.tsx`

**Interfaces:**
- Produces: `renderWithI18n(ui: ReactElement, options?: { lang?: 'en' | 'ar' }): Promise<RenderResult>` from `@/test-utils` — only `DetailHeader.test.tsx` uses this in this plan; a future pass testing `components/layout/` may reuse it.
- Consumes: `DetailHeader` from `./DetailHeader` (already implemented, do not modify). `ensureI18nInitialized`, default `i18n` export, `AppLanguage` type from `@/i18n`.

- [ ] **Step 1: Write the shared `test-utils.tsx`**

Create `apps/planner/src/test-utils.tsx`:

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

- [ ] **Step 2: Write `DetailHeader.test.tsx`**

Create `apps/planner/src/components/ui/DetailHeader.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { DetailHeader } from './DetailHeader';

const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('DetailHeader', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('renders the crumb and action children', async () => {
    const { getByText } = await renderWithI18n(
      <DetailHeader crumb="Overview">
        <button>Action</button>
      </DetailHeader>
    );
    expect(getByText('Overview')).toBeInTheDocument();
    expect(getByText('Action')).toBeInTheDocument();
  });

  test('clicking back calls router.back() when onBack is not provided', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />);
    fireEvent.click(container.querySelector('button')!);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('clicking back calls the provided onBack instead of router.back()', async () => {
    const onBack = jest.fn();
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" onBack={onBack} />);
    fireEvent.click(container.querySelector('button')!);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('LTR: back-arrow icon has no rotate-180 class', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />, { lang: 'en' });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).not.toContain('rotate-180');
  });

  test('RTL: back-arrow icon gets the rotate-180 class', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />, { lang: 'ar' });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).toContain('rotate-180');
  });
});
```

- [ ] **Step 3: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false DetailHeader.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 4: Run the full suite together**

Run: `cd apps/planner && npm test -- --watchAll=false`
Expected: all 10 test files pass (2 from `lib/` + 8 from `components/ui/`), every test green, 0 failures.

- [ ] **Step 5: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files — nothing new in `test-utils.tsx` or `DetailHeader.test.tsx`.

- [ ] **Step 6: Commit**

```bash
cd apps/planner
git add src/test-utils.tsx src/components/ui/DetailHeader.test.tsx
git commit -m "Add DetailHeader unit tests"
```
