# apps/customer Unit Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Jest for `apps/customer` and add unit tests for its four pure-logic modules (`dealStateMachine`, `format`, `db`'s `toPlanner`, `notificationRoute`) — the app currently has zero test infrastructure anywhere.

**Architecture:** Standard Expo-documented Jest setup (`jest-expo` preset, config in `package.json`, no separate `jest.config.js`). Four colocated `*.test.ts` files, one per target module, each testing pure functions with no React/Expo runtime dependencies — no mocking needed anywhere in this plan.

**Tech Stack:** Jest, `jest-expo` preset, `@types/jest`. No `@testing-library/react-native` (out of scope — see spec's non-goals).

## Global Constraints

- Config lives in `apps/customer/package.json` only (`"jest"` key) — no `jest.config.js`. This matches the current Expo docs (verified live against `https://docs.expo.dev/develop/unit-testing/` during design, not assumed from training data — `apps/customer/AGENTS.md` warns this SDK version has changed from what any model was trained on).
- Test files are colocated with source: `src/lib/<name>.test.ts` next to `src/lib/<name>.ts`.
- These tests cover **already-implemented, already-correct** source code (three of the four modules' expected behavior was manually verified during this session's design work). This is a characterization/regression-test pass, not new-feature TDD — there is no RED step where source is missing. Each task's verification is "write the test, run it, confirm it passes" (proving both the test and the source are correct together), not red-green-refactor.
- No coverage threshold enforcement, no CI wiring — explicit non-goals from the spec.
- After each task: `npx tsc --noEmit` must stay clean (no new errors beyond whatever pre-existing baseline exists — check baseline once in Task 1 and compare against it in later tasks), and `npm run lint` must stay clean on touched files.

---

## Task 1: Jest setup + `dealStateMachine.test.ts`

**Files:**
- Modify: `apps/customer/package.json` (add `test` script, `jest` config key, three new devDependencies)
- Modify: `apps/customer/tsconfig.json` (add `types: ["jest"]`)
- Create: `apps/customer/src/lib/dealStateMachine.test.ts`

**Interfaces:**
- Consumes: `canTransition(from: DealStatus, to: DealStatus): boolean`, `isTerminal(status: DealStatus): boolean`, `nextExpected(status: DealStatus): DealStatus | null` — all from `apps/customer/src/lib/dealStateMachine.ts` (already implemented, do not modify). `DealStatus` type from `apps/customer/src/lib/database.types.ts`, one of: `'request' | 'offer_sent' | 'accepted' | 'countersigned' | 'deposit_paid' | 'completed' | 'reviewed' | 'declined' | 'cancelled'`.
- Produces: a working `npm test` command for the whole app, usable by every later task in this plan.

- [ ] **Step 1: Record the current tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: exits with whatever the current state is (likely clean — record the exact output either way, you'll compare against it after every later task).

- [ ] **Step 2: Install the test dependencies**

```bash
cd apps/customer
npx expo install jest-expo jest @types/jest --dev
```

Expected: `package.json`'s `devDependencies` gains `jest`, `jest-expo`, and `@types/jest` entries (versions chosen by `expo install` for SDK compatibility — do not hand-pick versions).

- [ ] **Step 3: Add the test script and Jest config**

In `apps/customer/package.json`, the `"scripts"` block currently reads:

```json
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
```

Add a `"test"` entry:

```json
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "test": "jest --watchAll"
  },
```

Then add a top-level `"jest"` key (sibling of `"scripts"`, `"dependencies"`, etc.):

```json
  "jest": {
    "preset": "jest-expo"
  },
```

- [ ] **Step 4: Add `jest` to tsconfig's types array**

`apps/customer/tsconfig.json` currently has no `types` array. Add one inside `compilerOptions`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"],
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

- [ ] **Step 5: Write `dealStateMachine.test.ts`**

Create `apps/customer/src/lib/dealStateMachine.test.ts`:

```typescript
import { canTransition, isTerminal, nextExpected } from './dealStateMachine';
import type { DealStatus } from './database.types';

describe('canTransition', () => {
  test.each<[DealStatus, DealStatus]>([
    ['request', 'offer_sent'],
    ['request', 'cancelled'],
    ['offer_sent', 'accepted'],
    ['offer_sent', 'declined'],
    ['offer_sent', 'cancelled'],
    ['accepted', 'countersigned'],
    ['accepted', 'cancelled'],
    ['countersigned', 'deposit_paid'],
    ['countersigned', 'cancelled'],
    ['deposit_paid', 'completed'],
    ['completed', 'reviewed'],
  ])('allows every mapped transition: %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  test.each<[DealStatus, DealStatus]>([
    ['request', 'completed'],
    ['offer_sent', 'deposit_paid'],
    ['accepted', 'reviewed'],
    ['completed', 'accepted'],
  ])('blocks transitions not in the map: %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  test('cancellation override allows a transition the plain map does not list', () => {
    // TRANSITIONS.deposit_paid is ['completed'] only — no 'cancelled' entry.
    // This only passes because of canTransition's special-case override for
    // cancelling from any non-terminal state. Without that override, this
    // specific case would incorrectly return false.
    expect(canTransition('deposit_paid', 'cancelled')).toBe(true);
  });

  test.each<DealStatus>(['declined', 'cancelled', 'reviewed'])(
    'cancellation override does not apply to terminal state: %s -> cancelled',
    (from) => {
      expect(canTransition(from, 'cancelled')).toBe(false);
    }
  );
});

describe('isTerminal', () => {
  test.each<DealStatus>(['declined', 'cancelled', 'reviewed'])('%s is terminal', (status) => {
    expect(isTerminal(status)).toBe(true);
  });

  test.each<DealStatus>([
    'request',
    'offer_sent',
    'accepted',
    'countersigned',
    'deposit_paid',
    'completed',
  ])('%s is not terminal', (status) => {
    expect(isTerminal(status)).toBe(false);
  });
});

describe('nextExpected', () => {
  test.each<[DealStatus, DealStatus]>([
    ['request', 'offer_sent'],
    ['offer_sent', 'accepted'],
    ['accepted', 'countersigned'],
    ['countersigned', 'deposit_paid'],
    ['deposit_paid', 'completed'],
    ['completed', 'reviewed'],
  ])('%s expects %s next', (status, expected) => {
    expect(nextExpected(status)).toBe(expected);
  });

  test.each<DealStatus>(['reviewed', 'declined', 'cancelled'])(
    '%s has no next expected status',
    (status) => {
      expect(nextExpected(status)).toBeNull();
    }
  );
});
```

- [ ] **Step 6: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false dealStateMachine`
Expected: all tests in `dealStateMachine.test.ts` pass (11 mapped-transition cases + 4 blocked cases + 1 override case + 3 terminal-exclusion cases + 3 terminal cases + 6 not-terminal cases + 6 nextExpected cases + 3 null cases — every `test`/`test.each` row green, 0 failures).

- [ ] **Step 7: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: matches the baseline from Step 1 — no new errors introduced by the config changes or the new test file.

- [ ] **Step 8: Commit**

```bash
cd apps/customer
git add package.json package-lock.json tsconfig.json src/lib/dealStateMachine.test.ts
git commit -m "Add Jest setup and dealStateMachine unit tests"
```

---

## Task 2: `format.test.ts`

**Files:**
- Create: `apps/customer/src/lib/format.test.ts`

**Interfaces:**
- Consumes: `formatNumber(value: number, isRTL: boolean): string`, `formatDate(date: Date, isRTL: boolean, options: Intl.DateTimeFormatOptions): string` from `apps/customer/src/lib/format.ts` (already implemented, do not modify). `npm test` from Task 1.

- [ ] **Step 1: Write `format.test.ts`**

Create `apps/customer/src/lib/format.test.ts`:

```typescript
import { formatDate, formatNumber } from './format';

describe('formatNumber', () => {
  test('renders Western digits in LTR', () => {
    expect(formatNumber(1234, false)).toBe((1234).toLocaleString('en-US'));
  });

  test('renders Arabic-Indic digits in RTL', () => {
    const result = formatNumber(1234, true);
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
  const date = new Date('2026-07-13T12:00:00Z');
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  test('LTR uses en-GB Gregorian formatting', () => {
    expect(formatDate(date, false, options)).toBe(
      new Intl.DateTimeFormat('en-GB', options).format(date)
    );
  });

  test('RTL forces the Gregorian calendar rather than defaulting to Hijri', () => {
    const result = formatDate(date, true, options);
    expect(result).toBe(new Intl.DateTimeFormat('ar-SA-u-ca-gregory', options).format(date));

    // Prove the override actually matters: plain 'ar-SA' (no calendar
    // override) defaults to the Hijri calendar on ICU, which reports a
    // different year than the Gregorian one. If formatDate's '-u-ca-gregory'
    // suffix were ever accidentally dropped, this assertion would catch it.
    const hijriResult = new Intl.DateTimeFormat('ar-SA', options).format(date);
    expect(result).not.toBe(hijriResult);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false format`
Expected: all tests in `format.test.ts` pass (2 `formatNumber` cases + 2 `formatDate` cases, 0 failures). If the `hijriResult` assertion in the RTL `formatDate` test fails (i.e. `ar-SA` and `ar-SA-u-ca-gregory` produce the *same* output for this date), do not weaken the assertion — that would mean Node's bundled ICU data doesn't default `ar-SA` to Hijri in this environment, which is worth flagging back rather than silently working around, since it means the regression this test is meant to catch can't be caught here.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: matches the baseline recorded in Task 1 Step 1 — no new errors.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/lib/format.test.ts
git commit -m "Add format unit tests"
```

---

## Task 3: `db.test.ts`

**Files:**
- Create: `apps/customer/src/lib/db.test.ts`

**Interfaces:**
- Consumes: `toPlanner(row: DBPlannerRow): Planner` and the `DBPlannerRow`/`DBService` types from `apps/customer/src/lib/db.ts` (already implemented, do not modify). `npm test` from Task 1.

- [ ] **Step 1: Write `db.test.ts`**

Create `apps/customer/src/lib/db.test.ts`:

```typescript
import { toPlanner, type DBPlannerRow } from './db';

function makeRow(overrides: Partial<DBPlannerRow> = {}): DBPlannerRow {
  return {
    user_id: 'planner-1',
    business_name: 'Lumière Events',
    bio: 'Award-winning studio crafting unforgettable celebrations.',
    city: 'riyadh',
    categories: ['weddings', 'galas'],
    verified: true,
    tier: 'standard',
    rating: 4.8,
    reviews_count: 120,
    instagram: '@lumiere',
    website: 'https://lumiere.example',
    portfolio_urls: ['https://img.example/1', 'https://img.example/2'],
    profiles: { avatar_seed: 7 },
    planner_services: [
      { id: 's1', name: 'Full Wedding Planning', description: 'End-to-end planning.', from_price: 18000, seed: 0, image_url: null },
      { id: 's2', name: 'Luxury Gala Production', description: null, from_price: 42000, seed: 1, image_url: 'https://img.example/s2' },
    ],
    ...overrides,
  };
}

test('maps direct fields through unchanged', () => {
  const planner = toPlanner(makeRow());
  expect(planner.id).toBe('planner-1');
  expect(planner.name).toBe('Lumière Events');
  expect(planner.city).toBe('riyadh');
  expect(planner.rating).toBe(4.8);
  expect(planner.events).toBe(120);
  expect(planner.verified).toBe(true);
  expect(planner.blurb).toBe('Award-winning studio crafting unforgettable celebrations.');
  expect(planner.tags).toEqual(['weddings', 'galas']);
});

describe('premium', () => {
  test.each(['Premium', 'premium', 'PREMIUM'])('tier %s is premium', (tier) => {
    expect(toPlanner(makeRow({ tier })).premium).toBe(true);
  });

  test('tier standard is not premium', () => {
    expect(toPlanner(makeRow({ tier: 'standard' })).premium).toBe(false);
  });

  test('tier essentials is not premium (regression guard for the historical bug documented in db.ts)', () => {
    // db.ts's comment above `premium:` documents that comparing tier against
    // 'essentials' used to always evaluate true, since tier is never that
    // value — every planner was incorrectly marked premium. This locks in
    // the fix.
    expect(toPlanner(makeRow({ tier: 'essentials' })).premium).toBe(false);
  });
});

describe('from (minimum price)', () => {
  test('is the lowest from_price across services', () => {
    expect(toPlanner(makeRow()).from).toBe(18000);
  });

  test('is 0 when there are no services', () => {
    expect(toPlanner(makeRow({ planner_services: [] })).from).toBe(0);
  });
});

describe('null defaults', () => {
  test('profiles: null defaults seed to 0', () => {
    expect(toPlanner(makeRow({ profiles: null })).seed).toBe(0);
  });

  test('bio: null defaults blurb to empty string', () => {
    expect(toPlanner(makeRow({ bio: null })).blurb).toBe('');
  });

  test('portfolio_urls: null defaults portfolioUrls to an empty array', () => {
    expect(toPlanner(makeRow({ portfolio_urls: null })).portfolioUrls).toEqual([]);
  });
});

describe('type (category label)', () => {
  test('joins multiple mapped categories with " & "', () => {
    expect(toPlanner(makeRow({ categories: ['weddings', 'galas'] })).type).toBe('Weddings & Galas');
  });

  test('passes an unmapped category through unchanged rather than dropping it', () => {
    expect(toPlanner(makeRow({ categories: ['weddings', 'unmapped_category'] })).type).toBe(
      'Weddings & unmapped_category'
    );
  });
});

test('services and packages reshape planner_services with the documented field renames', () => {
  const planner = toPlanner(makeRow());

  expect(planner.services[0]).toEqual({
    name: 'Full Wedding Planning',
    desc: 'End-to-end planning.',
    from: 18000,
    seed: 0,
    imageUrl: null,
  });

  expect(planner.packages[0]).toEqual({
    name: 'Full Wedding Planning',
    note: 'End-to-end planning.',
    price: 18000,
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false db.test`
Expected: all tests in `db.test.ts` pass (1 direct-fields test + 3 premium cases + 2 not-premium cases + 2 min-price cases + 3 null-default cases + 2 category-label cases + 1 reshape test, 0 failures).

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: matches the baseline recorded in Task 1 Step 1 — no new errors.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/lib/db.test.ts
git commit -m "Add db.ts toPlanner unit tests"
```

---

## Task 4: `notificationRoute.test.ts`

**Files:**
- Create: `apps/customer/src/lib/notificationRoute.test.ts`

**Interfaces:**
- Consumes: `notificationRoute(n: { type: string; payload: Record<string, unknown> }): { pathname: string; params?: Record<string, string> } | null` from `apps/customer/src/lib/notificationRoute.ts` (already implemented, do not modify — this exact function and these exact cases were manually verified via a one-off script during the original chat-push-notifications work earlier in this project's history; this task makes that verification permanent). `npm test` from Task 1.

- [ ] **Step 1: Write `notificationRoute.test.ts`**

Create `apps/customer/src/lib/notificationRoute.test.ts`:

```typescript
import { notificationRoute } from './notificationRoute';

test('offer_received routes to /proposals with the request id', () => {
  const route = notificationRoute({
    type: 'offer_received',
    payload: { request_id: 'req-1', offer_id: 'off-1', planner_id: 'pl-1', planner_name: 'Lumière Events', price: 42000 },
  });
  expect(route).toEqual({ pathname: '/proposals', params: { id: 'req-1' } });
});

test('offer_accepted routes to /checkout with the offer id', () => {
  const route = notificationRoute({
    type: 'offer_accepted',
    payload: { request_id: 'req-1', offer_id: 'off-1', planner_id: 'pl-1', planner_name: 'Lumière Events' },
  });
  expect(route).toEqual({ pathname: '/checkout', params: { offerId: 'off-1' } });
});

test('booking_confirmed routes to /booking/[id] with the booking id', () => {
  const route = notificationRoute({
    type: 'booking_confirmed',
    payload: { booking_id: 'bk-1', request_id: 'req-1', planner_id: 'pl-1', planner_name: 'Lumière Events' },
  });
  expect(route).toEqual({ pathname: '/booking/[id]', params: { id: 'bk-1' } });
});

test('message routes to /chat/[requestId] with all chat params, coercing planner_seed to a string', () => {
  const route = notificationRoute({
    type: 'message',
    payload: {
      request_id: 'req-1',
      message_id: 'msg-1',
      planner_id: 'pl-1',
      planner_name: 'Lumière Events',
      planner_seed: 3,
      preview: 'Hi there',
    },
  });
  expect(route).toEqual({
    pathname: '/chat/[requestId]',
    params: {
      requestId: 'req-1',
      plannerId: 'pl-1',
      plannerName: 'Lumière Events',
      plannerSeed: '3',
    },
  });
});

test('an unknown event type returns null rather than a broken route', () => {
  const route = notificationRoute({ type: 'bogus_event', payload: {} });
  expect(route).toBeNull();
});

test('a malformed message payload missing planner_id returns null rather than an incomplete route', () => {
  const route = notificationRoute({ type: 'message', payload: { request_id: 'req-1' } });
  expect(route).toBeNull();
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false notificationRoute`
Expected: all 6 tests in `notificationRoute.test.ts` pass, 0 failures.

- [ ] **Step 3: Run the full suite together**

Run: `cd apps/customer && npm test -- --watchAll=false`
Expected: all 4 test files run, every test across all of them passes, 0 failures.

- [ ] **Step 4: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: matches the baseline recorded in Task 1 Step 1 — no new errors.

- [ ] **Step 5: Lint check**

Run: `cd apps/customer && npm run lint`
Expected: no new lint errors on any of the four new test files (pre-existing lint findings elsewhere in the app, if any, are not this plan's concern).

- [ ] **Step 6: Commit**

```bash
cd apps/customer
git add src/lib/notificationRoute.test.ts
git commit -m "Add notificationRoute unit tests"
```
