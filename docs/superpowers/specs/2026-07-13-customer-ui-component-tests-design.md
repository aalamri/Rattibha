# Component tests for apps/customer/src/components/ui — design

Date: 2026-07-13

## Problem

The pure-logic pass (`docs/superpowers/specs/2026-07-13-customer-unit-tests-design.md`) explicitly deferred component/UI tests. `apps/customer` still has zero coverage on its actual rendered UI. This is the first slice of that deferred follow-up.

## Scope

In scope: the 10 presentational components in `apps/customer/src/components/ui/`:
`Avatar`, `Badge` (+ `Stars`), `Button`, `Card`, `EmptyState`, `Input`, `Photo`, `Text` (+ `AccentText`), `Toast` (+ `ToastProvider`/`useToast`), `Skeleton` (+ `SkeletonRow`/`SkeletonCard`).

Each component that reads `useIsRTL()`/`useTranslation()` gets both an LTR and an RTL case. `Card` and `EmptyState` only read `useTheme()` (no i18n dependency) and get a single default-locale case.

Explicitly out of scope (separate follow-ups):
- Feature components (`components/auth/`, `components/discover/`, `components/planner/`).
- Context/lib wrapper modules (`AuthContext.tsx`, `pushNotifications.ts`, `supabase.ts`) — the ones named in the original spec's deferral.
- Full screens under `app/`.
- Snapshot testing, visual/screenshot regression testing.
- Asserting on in-flight `Animated` interpolated values or intermediate frames (`Toast`'s enter/exit animation, `Skeleton`'s opacity loop) — only structural/behavioral output is asserted.

## Design

### 1. Framework setup

Verify against current docs before installing (`apps/customer/AGENTS.md`'s standing rule — this SDK version has changed from training data). Already confirmed live against `https://docs.expo.dev/develop/unit-testing/`:

```bash
npx expo install @testing-library/react-native --dev
```

No separate `jest-native`/matcher package — current `@testing-library/react-native` versions bundle the Jest matchers (`toBeDisabled`, `toHaveStyle`, etc.) internally. `jest-expo` (already installed from the prior pass) remains the preset; no `jest.config.js` — config stays in `apps/customer/package.json`.

Two more test-time dependencies are already production dependencies, so no new installs, only Jest wiring:
- `@react-native-async-storage/async-storage` — both `ThemeProvider` and the i18n singleton touch it on mount. Use the package's own Jest mock (`@react-native-async-storage/async-storage/jest/async-storage-mock`), wired via `jest.mock(...)` in the shared test-utils module (or `setupFilesAfterEach` in `package.json`'s `jest` config — implementer verifies which current `jest-expo` docs recommend).
- `react-native-safe-area-context` — only `Toast`'s `ToastProvider` calls `useSafeAreaInsets()`. Rather than wire this globally, `Toast.test.tsx` wraps locally with the package's own `SafeAreaProvider`/`initialWindowMetrics` test helpers. Verify the exact current import path against the installed version's own docs/README at implementation time — don't assume from memory.

### 2. Shared test utilities

New file: `apps/customer/src/test-utils.tsx`

Every one of these components reads from the real `ThemeContext` (`useTheme()`) and/or the real `i18next` singleton (`useIsRTL()` → `useTranslation()`), both wired at the app root via `<I18nextProvider i18n={i18n}><ThemeProvider>` (`apps/customer/src/app/_layout.tsx`). Tests use the **real** providers, not mocks — the point is confidence in the actual `useTheme`/`useIsRTL` hook chain, not a chain that's been mocked away.

Exports:
- `renderWithProviders(ui, { lang = 'en' } = {})` — awaits the app's real `initI18n()` (idempotent — safe to call once per test), calls `i18n.changeLanguage(lang)`, then renders `ui` wrapped in `<I18nextProvider i18n={i18n}><ThemeProvider>`. Returns the same result object `@testing-library/react-native`'s `render` does (spread it through).
- A `resetI18nLanguage` step registered once, in `afterEach` (or a global `jest.setup.ts` referenced from `package.json`'s `jest.setupFilesAfterEach`) — `i18n` is a module-level singleton shared across every test file in the run; leaving it on `'ar'` after an RTL case would leak into the next file's default-LTR assumption and produce a flaky, order-dependent failure. Reset to `'en'` after every test, not just every file.

### 3. Test file placement

Colocated `*.test.tsx` next to each source file, one file per source file (not per exported component — `Badge.test.tsx` covers both `Badge` and `Stars`, `Skeleton.test.tsx` covers `Skeleton`/`SkeletonRow`/`SkeletonCard`, `Text.test.tsx` covers `Text`/`AccentText`):

- `src/components/ui/Avatar.test.tsx`
- `src/components/ui/Badge.test.tsx`
- `src/components/ui/Button.test.tsx`
- `src/components/ui/Card.test.tsx`
- `src/components/ui/EmptyState.test.tsx`
- `src/components/ui/Input.test.tsx`
- `src/components/ui/Photo.test.tsx`
- `src/components/ui/Text.test.tsx`
- `src/components/ui/Toast.test.tsx`
- `src/components/ui/Skeleton.test.tsx`

### 4. Test cases

**`Avatar.test.tsx`**
- Renders the given `initials` as visible text.
- `seed` selects `gradients[seed % gradients.length]` — assert the rendered gradient element's `colors` prop matches the expected pair (query via `UNSAFE_getByType(LinearGradient)`, the pragmatic escape hatch for a non-text prop with no accessible role).
- RTL: the initials' text style resolves the Arabic bold font family instead of the Latin one.

**`Badge.test.tsx`**
- Renders `children` text; renders the optional icon when provided, omits it when not.
- `Stars`: renders the numeric/string `rating` wrapped in a `Badge` with the star icon.
- RTL: container `flexDirection` is `row-reverse` (LTR: `row`).

**`Button.test.tsx`**
- Renders the label text.
- `onPress` fires on press when not `disabled`/`loading`.
- `disabled`: `onPress` does not fire when pressed; `accessibilityState.disabled` is `true`; container opacity reflects the disabled visual state.
- `loading`: renders `ActivityIndicator` instead of the label; `accessibilityState.busy` is `true`.
- RTL: inner row `flexDirection` is `row-reverse` (icon/label order flips); label font family resolves to the Arabic bold font.

**`Card.test.tsx`**
- Renders `children`.
- `elevated`: applies `shadows.md`; default applies `shadows.sm` (assert via the flattened style array, not a snapshot).
- Background/border colors come from the active theme (`theme.bgSurface`/`theme.border`).

**`EmptyState.test.tsx`**
- Always renders `icon` and `title`.
- Renders `subtitle` only when provided; renders `children` only when provided.
- Icon/circle colors come from the active theme (`theme.bgBlush`/`theme.brand`).

**`Input.test.tsx`**
- Renders `label` when provided, omits the label row when not.
- Typing fires `onChangeText` (`fireEvent.changeText`) with the typed value.
- Focus/blur (`fireEvent(input, 'focus')`/`'blur'`) toggle the focused border color; an `error` prop overrides both and shows the error message text, with `theme.danger` as the border color.
- Trailing-icon press calls `onTrailingIconPress` once.
- RTL: row `flexDirection` is `row-reverse`; `textAlign` is `right`; the trailing-icon button's `accessibilityLabel` renders the real Arabic string from `ar.json`'s `common.togglePasswordVisibility` key (read the expected string from the actual locale resource file in the test, not a hardcoded duplicate, so the test can't silently drift from the real translation).

**`Photo.test.tsx`**
- `uri` set: renders an `Image` with `source={{ uri }}`.
- `uri` unset: renders the gradient placeholder with the fallback image icon, no `Image` element.
- `label` set: renders a `Badge` positioned via the RTL-dependent key — LTR: `style.left` is set (no `style.right`); RTL: `style.right` is set (no `style.left`). This is the one existing behavior most likely to silently regress (the `[isRTL ? 'right' : 'left']: 8` computed-key pattern), so assert the *absence* of the wrong key, not just the presence of the right one.
- `children` render through in both the `uri` and placeholder branches.

**`Text.test.tsx`**
- `variant` selects the corresponding `getTextStyle(variant, isRTL, theme)` output (spot-check 2-3 variants, e.g. `h1` and `caption`, against the real `getTextStyle` return value rather than hardcoded pixel values, so this test tracks `typography.ts` instead of duplicating it).
- **Regression guard, documented directly in the source comment:** a caller-provided `style={{ lineHeight: N }}` is dropped in RTL (replaced by the font-appropriate line height) but kept as-is in LTR. Assert both directions explicitly — this is exactly the kind of behavior a future edit could silently break without a test failing.
- `AccentText`: resolves the italic display font and `theme.brand` color.

**`Toast.test.tsx`**
- Needs a small test-only consumer component (`function Probe() { const { show } = useToast(); return <Button title="show" onPress={() => show('Hello', 'error')} />; }`) rendered inside `<SafeAreaProvider><ToastProvider><Probe /></ToastProvider></SafeAreaProvider>`, since `ToastProvider` itself takes no message prop — the message only appears after calling `show()` from a consumer.
- Calling `show(message, tone)` renders the message text and the tone-appropriate icon/colors.
- Calling `show()` four times keeps only the last 3 toasts visible (`prev.slice(-2)` + the new one) — assert exactly 3 message texts are present, and that the oldest of the four is gone.
- **Explicitly not covered:** the dismiss-on-press and 3200ms auto-dismiss paths depend on `Animated.timing(...).start(callback)` actually invoking its completion callback under Jest's Animated mock, which is uncertain without running it (this project's own house rule, learned the hard way on the previous test pass, is to verify environment-dependent `Intl`/timer/animation behavior empirically rather than assume it from memory or docs). The implementer should try it with `jest.useFakeTimers()` + advancing timers; if the callback doesn't fire in this environment, drop that specific assertion rather than force it, and note why in the task report — same handling as the `format.test.ts` Hijri/Gregorian case earlier in this project.

**`Skeleton.test.tsx`**
- `Skeleton`: renders with `width`/`height`/`radius` reflected in style, and `backgroundColor: theme.bgSunken`. Does not assert on the animated `opacity` value.
- `SkeletonRow`: renders `children` in a `flexDirection: 'row'` container with the given `gap`.
- `SkeletonCard`: renders `children` inside a themed container (`theme.bgSurface`/`theme.border`).

### 5. Verification

- `npm test -- --watchAll=false` (all 10 new files, plus the 4 existing pure-logic files) passes with zero failures.
- `npx tsc --noEmit` still matches the existing 13-error baseline (no new errors from test files or `test-utils.tsx`).
- `npm run lint` clean on all touched/new files.

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement in this pass (same reasoning as the prior pass — not agreed on yet).
- No CI wiring.
- No testing of animation timing/interpolation itself, only the structural output before/after a state change.
- No mocking-away of `ThemeContext`/i18n — tests exercise the real providers, by design (see Section 2).
