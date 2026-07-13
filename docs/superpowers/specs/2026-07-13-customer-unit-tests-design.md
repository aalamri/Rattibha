# Unit tests for apps/customer pure-logic modules — design

Date: 2026-07-13

## Problem

`apps/customer` (and the rest of the monorepo) has zero test infrastructure and zero tests. Previously flagged, not yet acted on.

## Scope

In scope: set up Jest for `apps/customer`, and write unit tests for the app's pure-logic modules — code with no React/React Native/Expo runtime dependencies, testable as plain functions with known inputs and outputs.

Target modules:
- `src/lib/dealStateMachine.ts` — `canTransition`, `isTerminal`, `nextExpected`
- `src/lib/format.ts` — `formatNumber`, `formatDate`
- `src/lib/db.ts` — `toPlanner` mapper
- `src/lib/notificationRoute.ts` — `notificationRoute`

Explicitly out of scope (confirmed with the user):
- Component/UI tests (would need `@testing-library/react-native` plus mocking Supabase, navigation, and native modules — a distinct, larger effort).
- `AuthContext.tsx`, `pushNotifications.ts`, `supabase.ts` — all wrap external services/native APIs rather than containing pure logic; meaningfully testing them means mocking Supabase and Expo's notification APIs, which belongs with the component-testing follow-up, not this pass.
- Any other app in the monorepo (`apps/planner`, `apps/website`) — this pass is `apps/customer` only, per the original ask.

## Design

### 1. Framework setup

Verified against the actual current Expo docs (not memory, per `apps/customer/AGENTS.md`'s warning that this SDK version has changed from training data) at `https://docs.expo.dev/develop/unit-testing/`.

Install:
```bash
npx expo install jest-expo jest @types/jest --dev
```

`apps/customer/package.json` additions:
```json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

`apps/customer/tsconfig.json`: add `"jest"` to the `compilerOptions.types` array.

No separate `jest.config.js` — current Expo docs put all config in `package.json`. No `transformIgnorePatterns` override — only add one if a real failure demonstrates the `jest-expo` preset's default doesn't cover something needed; not speculatively.

No `@testing-library/react-native` in this pass — not needed for pure-function tests, deferred to the component-testing follow-up.

### 2. Test file placement

Colocated `*.test.ts` next to each source file:
- `src/lib/dealStateMachine.test.ts`
- `src/lib/format.test.ts`
- `src/lib/db.test.ts`
- `src/lib/notificationRoute.test.ts`

### 3. Test cases

**`dealStateMachine.test.ts`**
- `canTransition`: every valid transition listed in the `TRANSITIONS` map returns `true` (one test per map entry, not just a sample — the map is small enough to cover exhaustively).
- `canTransition`: a representative set of invalid transitions returns `false` (e.g. `request` → `completed`, `offer_sent` → `deposit_paid`).
- `canTransition` cancellation override: `deposit_paid → cancelled` returns `true` even though `'cancelled'` does not appear in `TRANSITIONS.deposit_paid` — this is the one case that actually exercises the override branch rather than the plain map lookup, so it's the case that would catch a regression if the override were ever removed or narrowed.
- `canTransition` cancellation override does *not* apply to terminal states: `declined → cancelled`, `cancelled → cancelled`, and `reviewed → cancelled` all return `false`.
- `isTerminal`: `true` for `declined`, `cancelled`, `reviewed`; `false` for every non-terminal status.
- `nextExpected`: returns the first array entry for each status with a defined transition list; returns `null` for a terminal status (e.g. `reviewed`) and for a status with no map entry.

**`format.test.ts`**
- `formatNumber`: a multi-digit number in LTR (`isRTL: false`) renders Western digits (`toLocaleString('en-US')` output).
- `formatNumber`: the same number in RTL (`isRTL: true`) renders Arabic-Indic digits (`toLocaleString('ar-SA')` output) — asserts the actual Arabic-Indic digit characters appear, not just "output differs from LTR".
- `formatDate`: a fixed known date, formatted in LTR, matches the expected Gregorian `en-GB` output for given `options`.
- `formatDate`: the same fixed date in RTL still reports the correct Gregorian year/month/day (not the Hijri equivalent) — this is the regression test for the documented `-u-ca-gregory` behavior; pick a date where the Hijri and Gregorian year clearly differ so a regression is unambiguous in the assertion, not just visually.

**`db.test.ts`** (`toPlanner`)
- Minimal valid `DBPlannerRow` maps every direct field correctly (`id`, `name`, `city`, `rating`, `events`, `verified`, `blurb`, `tags`).
- `premium` is `true` when `tier` is `'Premium'` or `'premium'` (case-insensitivity), `false` for `'standard'`.
- `premium` is specifically `false` when `tier` is `'essentials'` — the documented historical bug (comment in source) was that this incorrectly evaluated `true`; this case guards against reintroducing it.
- `from` (min price): computed correctly across multiple `planner_services` rows with different `from_price` values; `0` when `planner_services` is empty.
- Null-default handling: `profiles: null` → `seed: 0`; `bio: null` → `blurb: ''`; `portfolio_urls: null` → `portfolioUrls: []`.
- `type` (category label): multiple categories join with `' & '`; an unmapped category string passes through unchanged rather than being dropped or throwing.
- `services`/`packages` arrays are both derived from `planner_services` with the documented field reshaping (`description` → `desc`/`note`, `from_price` → `from`/`price`).

**`notificationRoute.test.ts`**
- The 6 cases already manually verified earlier this session, made permanent: `offer_received`, `offer_accepted`, `booking_confirmed`, `message` (asserting the full params object, including the `plannerSeed` string coercion), an unknown event type returning `null`, and a malformed `message` payload (missing `planner_id`) returning `null`.

### 4. Verification

- `npm test` (all new test files) passes with zero failures.
- `npx tsc --noEmit` still clean (matches each app's existing baseline — no new errors introduced by test files or config changes).
- `npm run lint` still clean on the touched files.

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement configured in this pass — establishing the infrastructure and a real first slice of tests matters more right now than gating on a coverage number nobody has agreed to yet.
- No CI wiring (e.g., a GitHub Actions workflow running `npm test` on push) — this repo has no existing CI pipeline for either app; adding one is a separate decision outside this pass's scope.
