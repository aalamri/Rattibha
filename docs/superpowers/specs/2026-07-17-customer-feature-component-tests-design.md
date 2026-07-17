# Component tests for apps/customer/src/components/{auth,discover,planner} + root-level utilities — design

Date: 2026-07-17

## Problem

The `components/ui/` pass (`docs/superpowers/specs/2026-07-13-customer-ui-component-tests-design.md`) explicitly deferred feature components as a separate follow-up. `apps/customer` still has zero coverage on any component outside `components/ui/`. This is that deferred follow-up.

## Scope

In scope: all 11 real components (excluding the `components/auth/index.ts` barrel export, which re-exports only) outside `components/ui/`:

- Root-level: `LanguageToggle`, `PlaceholderScreen`
- `components/auth/`: `AuthHeader`, `Checkbox`, `OTPInput`
- `components/discover/`: `CitySheet`, `DateSheet`, `FeaturedCard`, `PlannerRow`
- `components/planner/`: `PackageOption`, `ServiceCard`

Explicitly out of scope (separate follow-ups):
- Screens under `app/`.
- `lib/AuthContext.tsx`, `lib/pushNotifications.ts`, `lib/supabase.ts`.
- Snapshot testing, visual/screenshot regression testing.
- Asserting on in-flight `Animated` interpolated values, native modal transition timing, or intermediate animation frames.

## Design

### 1. Test infrastructure — no new dependencies, no new mocking

None of the 11 components call `useRouter()` or any navigation hook (unlike `apps/planner`'s `DetailHeader`, which needed a dedicated `next/navigation` mock). Every component here reads at most `useTheme()` and/or `useIsRTL()`/`useTranslation()`, which the existing `apps/customer/src/test-utils.tsx` (`renderWithProviders`, built for the `components/ui/` pass) already wires through the app's real `ThemeProvider`/`I18nextProvider`. No new packages, no new global mocks.

### 2. Shared fixture helper

`FeaturedCard` and `PlannerRow` both require a full `Planner` object (`src/data/planners.ts`): 11 required fields (`id`, `name`, `city`, `type`, `rating`, `events`, `premium`, `verified`, `from`, `seed`, `blurb`, `tags`, `services`, `packages`). To avoid duplicating that literal across two files, add one fixture helper to `src/test-utils.tsx`:

```ts
export function makePlanner(overrides?: Partial<Planner>): Planner { ... }
```

Returns a minimally-valid `Planner` (e.g. empty `services`/`packages`/`tags` arrays, a fixed `seed`/`rating`) with `overrides` merged in — each test only specifies the fields it cares about (e.g. `{ premium: true }` for the premium-badge case).

`PackageOption` (`PlannerPackage`: `name`, `note`, `price`) and `ServiceCard` (`PlannerService`: `name`, `desc`, `from`, `seed`, `imageUrl?`) need only 2-4 fields each — small enough to inline as plain object literals per test file, no fixture helper needed for those.

### 3. Empirically verified: `Modal` rendering under this test environment

Read directly from the installed `react-native/Libraries/Modal/Modal.js`: `render()` returns `null` synchronously whenever `_shouldShowModal()` is false, and `_shouldShowModal()` reduces to `this.props.visible === true` (with an additional `isRendered` OR-condition on iOS that itself is set synchronously from `props.visible` in the constructor and `componentDidUpdate` — never dependent on an animation callback firing). Net effect for `CitySheet`/`DateSheet` tests:

- `visible={false}` → the component tree under `<Modal>` does not render at all (not hidden — absent).
- `visible={true}` → children render synchronously, no `act()`/fake-timer work needed to "wait for the animation" for structural assertions.

This matches the house rule (documented in the prior spec and in `apps/planner`'s plan) of verifying environment-dependent behavior empirically rather than assuming it — and means these two components need no special animation handling beyond what `Toast.test.tsx` already established for this app.

### 4. Test file placement

Colocated `*.test.tsx` next to each source file:

- `src/components/LanguageToggle.test.tsx`
- `src/components/PlaceholderScreen.test.tsx`
- `src/components/auth/AuthHeader.test.tsx`
- `src/components/auth/Checkbox.test.tsx`
- `src/components/auth/OTPInput.test.tsx`
- `src/components/discover/CitySheet.test.tsx`
- `src/components/discover/DateSheet.test.tsx`
- `src/components/discover/FeaturedCard.test.tsx`
- `src/components/discover/PlannerRow.test.tsx`
- `src/components/planner/PackageOption.test.tsx`
- `src/components/planner/ServiceCard.test.tsx`

### 5. Test cases

**`LanguageToggle.test.tsx`**
- LTR: renders `EN`; RTL: renders `ع` (the *next*-language label, matching the component's own `isRTL ? 'EN' : 'ع'` logic).
- Press calls the real `setAppLanguage` (from `@/i18n`) with the opposite language — assert via the real `i18n.language` value after the press (through `renderWithProviders`'s real provider chain), not a mock.
- `accessibilityLabel` resolves the real `common.toggleLanguage` translation string (read from the actual locale resource, not hardcoded).

**`PlaceholderScreen.test.tsx`**
- Always renders the given `title` and the real `common.comingSoon` translation.
- Renders `children` only when provided; omits it when not.

**`AuthHeader.test.tsx`**
- Renders at the given `height` (assert via the flattened container style array, not a snapshot).
- Back button renders and fires `onBack` only when `onBack` is provided; absent entirely when it isn't.
- RTL: glyph watermark position resolves `left` (not `right`); LTR: resolves `right` (not `left`) — assert absence of the wrong key, same pattern as the prior pass's `Photo.test.tsx` regression guard. Same check for the back button's position.

**`Checkbox.test.tsx`**
- Renders the check icon only when `checked` is `true`.
- Press calls `onChange(!checked)` (both directions: unchecked→`onChange(true)`, checked→`onChange(false)`).
- `accessibilityState.checked` reflects the `checked` prop.

**`OTPInput.test.tsx`**
- Renders `length` boxes (default 6), each showing the corresponding digit from `value` or empty.
- Typing digits into the hidden `TextInput` calls `onChange` with the new value, non-digit characters stripped, truncated to `length`.
- Box at the active index shows the focused/highlighted style only while the hidden input is focused (`fireEvent(input, 'focus'/'blur')`).

**`CitySheet.test.tsx`**
- `visible={false}`: nothing renders (per the empirically-verified `Modal` behavior above).
- `visible={true}`: renders every city from the real `CITY_KEYS` plus the "all cities" option, each with its real translated label.
- Typing in the search field filters the list to matching labels; clearing the query restores the full list.
- Pressing an option calls `onSelect` with that city's key (or `undefined` for "all").
- The currently-selected city (`current` prop) renders with its selected styling/check icon; others don't.
- RTL: row `flexDirection` is `row-reverse`.

**`DateSheet.test.tsx`**
- `visible={false}`: nothing renders.
- `visible={true}`: renders the calendar grid for `value`'s month, with the correct number of day cells and leading blanks.
- Dates before today are disabled (not selectable); pressing one does not call `onSelect`.
- Pressing an enabled date calls `onSelect(date)` then `onClose()`.
- Prev/next month buttons update the visible month (assert the rendered month label changes).
- RTL regression guard (mirroring `format.test.ts`'s pattern): a spy on `globalThis.Intl.DateTimeFormat` asserts it's constructed with `'ar-SA-u-ca-gregory'` when `isRTL` — not plain `'ar-SA'` — since this component calls `new Intl.DateTimeFormat(...)` directly (confirmed at implementation time whether the spy is actually observable in this environment, per the same house rule as `format.test.ts`; if not, fall back to the output-equality assertion alone and note why, same handling as documented there).

**`FeaturedCard.test.tsx`** (using `makePlanner`)
- Renders planner `name`, `city` (translated) + `type`, and `Stars` with the planner's `rating`.
- Renders the premium label on the photo only when `planner.premium` is `true`.
- Press calls `onPress(planner)`.

**`PlannerRow.test.tsx`** (using `makePlanner`)
- Renders planner `name`, `city` (translated) + `type`, `rating`, and the "from `SAR` `formatNumber(planner.from, isRTL)`" price line.
- Renders the premium `Badge` only when `planner.premium` is `true`.
- Press calls `onPress(planner)`.

**`PackageOption.test.tsx`**
- Renders `pkg.name`, `pkg.note`, and the "`SAR` `formatNumber(pkg.price, isRTL)`" price.
- `selected={true}` renders the filled inner dot and brand-colored border; `selected={false}` renders neither.
- Press calls `onPress`.

**`ServiceCard.test.tsx`**
- Renders `service.name`, `service.desc`, and the "from `SAR` `formatNumber(service.from, isRTL)`" price line.
- `numberOfLines` truncation props are present on name (1) and desc (2) `Text` elements (structural check, not visual truncation).

### 6. Verification

- `npm test -- --watchAll=false` (all 11 new files, plus the existing 14) passes with zero failures.
- `npx tsc --noEmit` matches the existing baseline (no new errors from test files, `test-utils.tsx`'s new `makePlanner` export, or any source file — none of the 11 components are modified).
- `npm run lint` clean on all touched/new files, no new findings.

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement.
- No CI wiring.
- No testing of animation timing/interpolation, native modal transitions, or intermediate frames.
- No mocking-away of `ThemeContext`/i18n — tests exercise the real providers, by design, matching the `components/ui/` pass.
- No modification of any of the 11 components' source files.
