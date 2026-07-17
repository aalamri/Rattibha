# Test coverage for apps/customer feature components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for all 11 real components in `apps/customer/src/components/` outside `components/ui/` (2 root-level utilities + `auth/`, `discover/`, `planner/`), the deferred follow-up to the `components/ui/` test pass.

**Architecture:** Reuse the existing `apps/customer/src/test-utils.tsx` (`renderWithProviders`) as-is — none of these 11 components need new mocking infrastructure. One shared fixture helper (`makePlanner`) is added to the same file for the two components needing a full `Planner` object. One genuine infrastructure gap, discovered empirically while scoping this plan, is fixed in Task 4: `AuthHeader.tsx`'s `require('@/assets/...')` does not currently resolve under Jest.

**Tech Stack:** `jest` + `jest-expo` (already configured), `@testing-library/react-native` (already installed), no new dependencies.

## Global Constraints

- **Baseline before this work starts:** `npx tsc --noEmit` in `apps/customer` → **12 errors**, confined to `src/app/(tabs)/profile.tsx` and `src/app/notifications.tsx`. `npm run lint` → **25 problems (17 errors, 8 warnings)**, confined to: `src/app/(tabs)/index.tsx`, `src/app/(tabs)/messages.tsx`, `src/app/_layout.tsx`, `src/app/chat/[requestId].tsx`, `src/app/checkout.tsx`, `src/app/edit-profile.tsx`, `src/app/proposals.tsx`, `src/app/search.tsx`, `src/components/discover/CitySheet.tsx` (**1 pre-existing error**, see below), `src/components/ui/Skeleton.tsx`, `src/i18n/index.ts`, `src/lib/AuthContext.tsx`, `src/test-utils.tsx` (**1 pre-existing warning**, see below). Every task below must keep both counts exactly at this baseline for the files it touches.
- **`src/components/discover/CitySheet.tsx:29` already has 1 pre-existing lint error** (`react-hooks/set-state-in-effect`, on `if (!visible) setQuery('');` inside a `useEffect`) — confirmed present before this plan's work starts. This is not touched or fixed by Task 10 (CitySheet is not modified); the lint baseline after Task 10 must show this exact same finding, unchanged.
- **`src/test-utils.tsx:12` already has 1 pre-existing lint warning** (`@typescript-eslint/no-require-imports`, on the `require('@react-native-async-storage/async-storage/jest/async-storage-mock')` call) — confirmed present before this plan's work starts. Task 8 modifies this file to add `makePlanner`; the pre-existing warning must remain and no new findings may be introduced.
- **Test infrastructure needs no changes except Task 8's `makePlanner` addition.** `renderWithProviders(ui, { lang = 'en' } = {})` (in `src/test-utils.tsx`) already wraps `ui` in the app's real `I18nextProvider`/`ThemeProvider`, already mocks `@react-native-async-storage/async-storage`, and already resets `i18n` to `'en'` in a shared `afterEach`. None of the 11 components in this plan need any additional mocking (no `next/navigation`-style router, no new native modules).
- **`react-native`'s `Modal` (used by `CitySheet`/`DateSheet`) renders synchronously and unconditionally on `visible`, confirmed by reading the installed `Modal.js` and by direct render test:** `visible={false}` → `render()`'s output (`toJSON()`) is `null`, nothing mounts. `visible={true}` → children render immediately, no `act()`/timer work needed to "wait for the animation" for structural assertions. Confirmed empirically — do not add any animation-timing handling for these two components.
- **Jest module resolution bug, fixed in Task 4:** `apps/customer/tsconfig.json` declares both `"@/*": ["./src/*"]` and the more specific `"@/assets/*": ["./assets/*"]`. TypeScript/Metro correctly prefer the more specific pattern, but `jest-expo`'s auto-derived `moduleNameMapper` (built from `tsconfig.json`'s `paths`, in declaration order) tries `^@/(.*)$` before `^@/assets/(.*)$` — and since `(.*)`  is greedy, the general pattern always matches first. This means `AuthHeader.tsx`'s `require('@/assets/images/brand/glyph-ra-light.png')` currently resolves to the non-existent `src/assets/images/brand/glyph-ra-light.png` instead of the real top-level `assets/images/brand/glyph-ra-light.png`, and rendering `AuthHeader` under Jest throws today. Confirmed empirically: adding an explicit `moduleNameMapper` to `package.json`'s `"jest"` key, with the more specific pattern listed first, fully replaces (not merges after) `jest-expo`'s auto-derived mapping and fixes resolution. Task 4, Step 1 makes this change; every task after it depends on it being in place.
- **`expo-image`'s `<Image>` (used by `AuthHeader`) resolves to host type `'ViewManagerAdapter_ExpoImage'`** under this test renderer — not `'Image'` (that's `react-native`'s built-in `Image`, already covered for `Photo.tsx` in the `components/ui/` pass). Confirmed empirically by dumping the rendered tree.
- **For a component whose own outermost rendered element has no wrapping host element contributed by `ThemeProvider`/`I18nextProvider`** (i.e. the component's own top-level View/Pressable ends up as the very root of the render tree — this is the case for `AuthHeader`), `render()`'s returned `root` TestInstance **is** that outermost element: `root.props.style` (optionally through `StyleSheet.flatten`) reads its style directly. `root.queryAll(predicate)` searches **strict descendants only** and will never match `root` itself — confirmed empirically (a `queryAll` predicate that matched `AuthHeader`'s outer container returned zero results, while `root.props.style` and `root.type` both read it correctly, and nested elements like the back button were still reachable via `queryAll`).
- **`DateSheet` computes "today" from the real system clock (`new Date()`), not from any prop.** Tests asserting disabled/enabled day behavior must pin the clock first — `jest.useFakeTimers()` then `jest.setSystemTime(new Date('2026-07-17T12:00:00Z'))` — and restore it afterward with `jest.useRealTimers()`. Confirmed empirically: pinning the clock this way renders correctly and produces deterministic disabled/enabled day presses; the real Modal/render path is unaffected by fake timers here since (per the Modal note above) nothing in the render path depends on a timer firing.
- **`DateSheet`'s three separate `Intl.DateTimeFormat` construction call sites (month label, weekday labels, day-cell labels) all share the same computed `locale` value** — confirmed empirically: `jest.spyOn(globalThis.Intl, 'DateTimeFormat')` while rendering in `ar` records multiple calls, all with the identical locale argument `'ar-SA-u-ca-gregory'`.
- No snapshot tests. No assertions on resolved/computed CSS values — only rendered text content, inline style properties actually set (read via `StyleSheet.flatten`), DOM/host structure, and behavior (via `fireEvent`).
- No modification of any of the 11 components' source files.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the baseline above, `npm run lint` introducing no new findings on the changed files, and a commit.

---

## Task 1: `LanguageToggle.test.tsx`

**Files:**
- Create: `apps/customer/src/components/LanguageToggle.test.tsx`

**Interfaces:**
- Consumes: `LanguageToggle` from `./LanguageToggle` (already implemented, do not modify). `renderWithProviders`, `i18n` from `@/test-utils` (already implemented, do not modify in this task).

- [ ] **Step 1: Write `LanguageToggle.test.tsx`**

Create `apps/customer/src/components/LanguageToggle.test.tsx`:

```tsx
import { fireEvent, waitFor } from '@testing-library/react-native';

import { i18n, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { LanguageToggle } from './LanguageToggle';

describe('LanguageToggle', () => {
  test('LTR (en): renders the ع label and pressing switches the real i18n language to ar', async () => {
    const { getByText } = await renderWithProviders(<LanguageToggle />, { lang: 'en' });
    expect(getByText('ع')).toBeTruthy();
    await fireEvent.press(getByText('ع'));
    await waitFor(() => expect(i18n.language).toBe('ar'));
  });

  test('RTL (ar): renders the EN label and pressing switches the real i18n language to en', async () => {
    const { getByText } = await renderWithProviders(<LanguageToggle />, { lang: 'ar' });
    expect(getByText('EN')).toBeTruthy();
    await fireEvent.press(getByText('EN'));
    await waitFor(() => expect(i18n.language).toBe('en'));
  });

  test('accessibilityLabel resolves the real common.toggleLanguage translation per locale', async () => {
    const enResult = await renderWithProviders(<LanguageToggle />, { lang: 'en' });
    expect(enResult.getByLabelText(en.common.toggleLanguage)).toBeTruthy();

    const arResult = await renderWithProviders(<LanguageToggle />, { lang: 'ar' });
    expect(arResult.getByLabelText(ar.common.toggleLanguage)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false LanguageToggle.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: 12 errors, same 2 files as the Global Constraints baseline.

Run: `cd apps/customer && npm run lint`
Expected: 25 problems (17 errors, 8 warnings), same files as the Global Constraints baseline — nothing new in `LanguageToggle.test.tsx`.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/LanguageToggle.test.tsx
git commit -m "Add LanguageToggle unit tests"
```

---

## Task 2: `PlaceholderScreen.test.tsx`

**Files:**
- Create: `apps/customer/src/components/PlaceholderScreen.test.tsx`

**Interfaces:**
- Consumes: `PlaceholderScreen` from `./PlaceholderScreen` (already implemented, do not modify). `Calendar` icon from `phosphor-react-native` (a real, existing export — confirmed).

- [ ] **Step 1: Write `PlaceholderScreen.test.tsx`**

Create `apps/customer/src/components/PlaceholderScreen.test.tsx`:

```tsx
import { Calendar } from 'phosphor-react-native';
import { Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  test('always renders the title and the real common.comingSoon translation', async () => {
    const { getByText } = await renderWithProviders(<PlaceholderScreen icon={Calendar} title="Bookings" />);
    expect(getByText('Bookings')).toBeTruthy();
    expect(getByText(en.common.comingSoon)).toBeTruthy();
  });

  test('renders children when provided', async () => {
    const { getByText } = await renderWithProviders(
      <PlaceholderScreen icon={Calendar} title="Bookings">
        <Text>Retry</Text>
      </PlaceholderScreen>
    );
    expect(getByText('Retry')).toBeTruthy();
  });

  test('omits children when not provided', async () => {
    const { queryByText } = await renderWithProviders(<PlaceholderScreen icon={Calendar} title="Bookings" />);
    expect(queryByText('Retry')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false PlaceholderScreen.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/PlaceholderScreen.test.tsx
git commit -m "Add PlaceholderScreen unit tests"
```

---

## Task 3: `Checkbox.test.tsx`

**Files:**
- Create: `apps/customer/src/components/auth/Checkbox.test.tsx`

**Interfaces:**
- Consumes: `Checkbox` from `./Checkbox` (already implemented, do not modify).

- [ ] **Step 1: Write `Checkbox.test.tsx`**

Create `apps/customer/src/components/auth/Checkbox.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  test('renders the check icon only when checked', async () => {
    const { root: checkedRoot } = await renderWithProviders(<Checkbox checked onChange={() => {}} />);
    expect(checkedRoot!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);

    const { root: uncheckedRoot } = await renderWithProviders(<Checkbox checked={false} onChange={() => {}} />);
    expect(uncheckedRoot!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(0);
  });

  test('pressing calls onChange with the toggled value', async () => {
    const onChangeFromUnchecked = jest.fn();
    const { getByRole: getByRoleUnchecked } = await renderWithProviders(
      <Checkbox checked={false} onChange={onChangeFromUnchecked} />
    );
    await fireEvent.press(getByRoleUnchecked('checkbox'));
    expect(onChangeFromUnchecked).toHaveBeenCalledWith(true);

    const onChangeFromChecked = jest.fn();
    const { getByRole: getByRoleChecked } = await renderWithProviders(<Checkbox checked onChange={onChangeFromChecked} />);
    await fireEvent.press(getByRoleChecked('checkbox'));
    expect(onChangeFromChecked).toHaveBeenCalledWith(false);
  });

  test('accessibilityState.checked reflects the checked prop', async () => {
    const { getByRole: getByRoleChecked } = await renderWithProviders(<Checkbox checked onChange={() => {}} />);
    expect(getByRoleChecked('checkbox').props.accessibilityState.checked).toBe(true);

    const { getByRole: getByRoleUnchecked } = await renderWithProviders(<Checkbox checked={false} onChange={() => {}} />);
    expect(getByRoleUnchecked('checkbox').props.accessibilityState.checked).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Checkbox.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/auth/Checkbox.test.tsx
git commit -m "Add Checkbox unit tests"
```

---

## Task 4: Jest asset-resolution fix + `AuthHeader.test.tsx`

**Files:**
- Modify: `apps/customer/package.json` (add explicit `jest.moduleNameMapper`)
- Create: `apps/customer/src/components/auth/AuthHeader.test.tsx`

**Interfaces:**
- Consumes: `AuthHeader` from `./AuthHeader` (already implemented, do not modify). `renderWithProviders` from `@/test-utils`.
- Produces: a working `@/assets/*` resolution under Jest, usable by any future test needing an asset under `apps/customer/assets/`.

- [ ] **Step 1: Fix the Jest module resolution for `@/assets/*`**

Open `apps/customer/package.json`. Find the `"jest"` key (currently `{ "preset": "jest-expo" }`) and replace it with:

```json
"jest": {
  "preset": "jest-expo",
  "moduleNameMapper": {
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

The more specific `@/assets/(.*)` pattern must come first — `jest-expo`'s own regex-first-match `moduleNameMapper` resolution otherwise matches the general `@/(.*)` pattern first and never reaches the specific one (see Global Constraints for the full empirical confirmation of this bug and fix).

- [ ] **Step 2: Confirm the fix with a throwaway render**

Run: `cd apps/customer && npx jest --watchAll=false -t "asset-resolution-smoke-test-does-not-exist"`
Expected: `Test Suites: 0 total` (no test matches the filter) with **no module-resolution error** printed during collection — this confirms Jest can still parse every existing test file (including ones that don't touch `AuthHeader`) without throwing. This is a quick sanity check before writing the real `AuthHeader` tests in the next step; it does not exercise `AuthHeader` itself.

- [ ] **Step 3: Write `AuthHeader.test.tsx`**

Create `apps/customer/src/components/auth/AuthHeader.test.tsx`:

```tsx
import { StyleSheet, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { AuthHeader } from './AuthHeader';

describe('AuthHeader', () => {
  test('renders at the given height', async () => {
    // AuthHeader's own outermost View has no wrapping host element contributed
    // by ThemeProvider/I18nextProvider, so it IS the render tree's root —
    // root.props.style reads it directly (see Global Constraints).
    const { root } = await renderWithProviders(<AuthHeader height={230} />);
    expect(StyleSheet.flatten(root!.props.style).height).toBe(230);
  });

  test('renders children centered inside the header', async () => {
    const { getByText } = await renderWithProviders(
      <AuthHeader height={230}>
        <Text>Logo</Text>
      </AuthHeader>
    );
    expect(getByText('Logo')).toBeTruthy();
  });

  test('back button renders and fires onBack only when onBack is provided', async () => {
    const { root: withoutBack } = await renderWithProviders(<AuthHeader height={230} />);
    expect(withoutBack!.queryAll((node) => node.props?.accessibilityRole === 'button')).toHaveLength(0);

    const onBack = jest.fn();
    const { getByLabelText } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />);
    await fireEvent.press(getByLabelText(en.common.back));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('LTR: glyph watermark resolves right, not left; back button resolves left, not right', async () => {
    const onBack = jest.fn();
    const { root } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />, { lang: 'en' });

    const glyph = root!.queryAll((node) => node.type === 'ViewManagerAdapter_ExpoImage')[0];
    const glyphStyle = StyleSheet.flatten(glyph.props.style);
    expect(glyphStyle.right).toBe(-28);
    expect(glyphStyle.left).toBeUndefined();

    const backButton = root!.queryAll((node) => node.props?.accessibilityRole === 'button')[0];
    const backWrapperStyle = StyleSheet.flatten(backButton.parent!.props.style);
    expect(backWrapperStyle.left).toBe(18);
    expect(backWrapperStyle.right).toBeUndefined();
  });

  test('RTL: glyph watermark resolves left, not right; back button resolves right, not left', async () => {
    const onBack = jest.fn();
    const { root } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />, { lang: 'ar' });

    const glyph = root!.queryAll((node) => node.type === 'ViewManagerAdapter_ExpoImage')[0];
    const glyphStyle = StyleSheet.flatten(glyph.props.style);
    expect(glyphStyle.left).toBe(-28);
    expect(glyphStyle.right).toBeUndefined();

    const backButton = root!.queryAll((node) => node.props?.accessibilityRole === 'button')[0];
    const backWrapperStyle = StyleSheet.flatten(backButton.parent!.props.style);
    expect(backWrapperStyle.right).toBe(18);
    expect(backWrapperStyle.left).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false AuthHeader.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 5: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 6: Commit**

```bash
cd apps/customer
git add package.json src/components/auth/AuthHeader.test.tsx
git commit -m "Fix Jest @/assets resolution and add AuthHeader unit tests"
```

---

## Task 5: `OTPInput.test.tsx`

**Files:**
- Create: `apps/customer/src/components/auth/OTPInput.test.tsx`

**Interfaces:**
- Consumes: `OTPInput` from `./OTPInput` (already implemented, do not modify). `lightTheme` from `@/theme/colors`.

- [ ] **Step 1: Write `OTPInput.test.tsx`**

Create `apps/customer/src/components/auth/OTPInput.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { OTPInput } from './OTPInput';

/** OTPInput's 6 visual digit boxes are the only Views sized 46x56 in the tree. */
function findBoxes(root: any) {
  return root.queryAll((node: any) => {
    const style = node.props?.style;
    if (!style) return false;
    const flat = StyleSheet.flatten(style);
    return flat.width === 46 && flat.height === 56;
  });
}

describe('OTPInput', () => {
  test('renders length boxes, each showing the corresponding digit from value', async () => {
    const { root, getByText, queryByText } = await renderWithProviders(<OTPInput value="12" onChange={() => {}} />);
    expect(findBoxes(root).length).toBe(6);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    // Empty boxes render no digit text — '3' through '6' were never typed.
    expect(queryByText('3')).toBeNull();
  });

  test('a custom length renders that many boxes', async () => {
    const { root } = await renderWithProviders(<OTPInput value="" onChange={() => {}} length={4} />);
    expect(findBoxes(root).length).toBe(4);
  });

  test('typing into the hidden input calls onChange with digits only, truncated to length', async () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = await renderWithProviders(<OTPInput value="12" onChange={onChange} />);
    const hiddenInput = getByDisplayValue('12');
    await fireEvent.changeText(hiddenInput, '123abc456789');
    expect(onChange).toHaveBeenCalledWith('123456');
  });

  test('the active box is highlighted with the brand border only while focused', async () => {
    const { root, getByDisplayValue } = await renderWithProviders(<OTPInput value="12" onChange={() => {}} />);
    // value.length === 2, length === 6 (default) -> activeIndex === 2.
    const activeBox = findBoxes(root)[2];
    expect(StyleSheet.flatten(activeBox.props.style).borderColor).toBe(lightTheme.borderStrong);

    const hiddenInput = getByDisplayValue('12');
    await fireEvent(hiddenInput, 'focus');
    expect(StyleSheet.flatten(findBoxes(root)[2].props.style).borderColor).toBe(lightTheme.brand);

    await fireEvent(hiddenInput, 'blur');
    expect(StyleSheet.flatten(findBoxes(root)[2].props.style).borderColor).toBe(lightTheme.borderStrong);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false OTPInput.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/auth/OTPInput.test.tsx
git commit -m "Add OTPInput unit tests"
```

---

## Task 6: `PackageOption.test.tsx`

**Files:**
- Create: `apps/customer/src/components/planner/PackageOption.test.tsx`

**Interfaces:**
- Consumes: `PackageOption` from `./PackageOption` (already implemented, do not modify). `PlannerPackage` type from `@/data/planners`.

- [ ] **Step 1: Write `PackageOption.test.tsx`**

Create `apps/customer/src/components/planner/PackageOption.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import type { PlannerPackage } from '@/data/planners';
import { PackageOption } from './PackageOption';

const pkg: PlannerPackage = { name: 'Gold Package', note: 'Up to 200 guests', price: 15000 };

describe('PackageOption', () => {
  test('renders name, note, and the formatted SAR price', async () => {
    const { getByText } = await renderWithProviders(<PackageOption pkg={pkg} selected={false} onPress={() => {}} />);
    expect(getByText('Gold Package')).toBeTruthy();
    expect(getByText('Up to 200 guests')).toBeTruthy();
    expect(getByText(`SAR ${(15000).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('selected renders the filled inner dot; unselected does not', async () => {
    const { root: selectedRoot } = await renderWithProviders(<PackageOption pkg={pkg} selected onPress={() => {}} />);
    // The filled inner dot is the sole 11x11 pill View, present only when selected.
    const selectedDot = selectedRoot!.queryAll((node) => {
      const style = node.props?.style;
      return !!style && style.width === 11 && style.height === 11;
    });
    expect(selectedDot).toHaveLength(1);

    const { root: unselectedRoot } = await renderWithProviders(
      <PackageOption pkg={pkg} selected={false} onPress={() => {}} />
    );
    const unselectedDot = unselectedRoot!.queryAll((node) => {
      const style = node.props?.style;
      return !!style && style.width === 11 && style.height === 11;
    });
    expect(unselectedDot).toHaveLength(0);
  });

  test('press calls onPress', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<PackageOption pkg={pkg} selected={false} onPress={onPress} />);
    await fireEvent.press(getByText('Gold Package'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false PackageOption.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/planner/PackageOption.test.tsx
git commit -m "Add PackageOption unit tests"
```

---

## Task 7: `ServiceCard.test.tsx`

**Files:**
- Create: `apps/customer/src/components/planner/ServiceCard.test.tsx`

**Interfaces:**
- Consumes: `ServiceCard` from `./ServiceCard` (already implemented, do not modify). `PlannerService` type from `@/data/planners`.

- [ ] **Step 1: Write `ServiceCard.test.tsx`**

Create `apps/customer/src/components/planner/ServiceCard.test.tsx`:

```tsx
import { renderWithProviders } from '@/test-utils';
import type { PlannerService } from '@/data/planners';
import { ServiceCard } from './ServiceCard';

const service: PlannerService = {
  name: 'Bridal Suite Styling',
  desc: 'Full styling and decor for the bridal suite, flowers included.',
  from: 2500,
  seed: 5,
};

describe('ServiceCard', () => {
  test('renders name, desc, and the formatted from-price', async () => {
    const { getByText } = await renderWithProviders(<ServiceCard service={service} />);
    expect(getByText('Bridal Suite Styling')).toBeTruthy();
    expect(getByText(service.desc)).toBeTruthy();
    expect(getByText(`from SAR ${(2500).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('name and desc carry their truncation props', async () => {
    const { getByText } = await renderWithProviders(<ServiceCard service={service} />);
    expect(getByText('Bridal Suite Styling').props.numberOfLines).toBe(1);
    expect(getByText(service.desc).props.numberOfLines).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false ServiceCard.test`
Expected: both tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/planner/ServiceCard.test.tsx
git commit -m "Add ServiceCard unit tests"
```

---

## Task 8: `makePlanner` fixture + `FeaturedCard.test.tsx`

**Files:**
- Modify: `apps/customer/src/test-utils.tsx` (add `makePlanner` export)
- Create: `apps/customer/src/components/discover/FeaturedCard.test.tsx`

**Interfaces:**
- Produces: `makePlanner(overrides?: Partial<Planner>): Planner` from `@/test-utils` — this task and Task 9 (`PlannerRow.test.tsx`) both consume it.
- Consumes: `FeaturedCard` from `./FeaturedCard` (already implemented, do not modify). `Planner` type from `@/data/planners`.

- [ ] **Step 1: Add `makePlanner` to `test-utils.tsx`**

Open `apps/customer/src/test-utils.tsx`. Add this import alongside the existing ones at the top:

```tsx
import type { Planner } from '@/data/planners';
```

Add this function anywhere after the imports (e.g. directly above `renderWithProviders`):

```tsx
/** Minimal valid Planner fixture — pass overrides for the fields a test cares about. */
export function makePlanner(overrides?: Partial<Planner>): Planner {
  return {
    id: 'planner-1',
    name: 'Layla Events',
    city: 'riyadh',
    type: 'Wedding Planner',
    rating: 4.8,
    events: 42,
    premium: false,
    verified: true,
    from: 5000,
    seed: 3,
    blurb: 'Full-service wedding and event planning across Riyadh.',
    tags: ['weddings'],
    services: [],
    packages: [],
    ...overrides,
  };
}
```

The full updated top of the file (imports + new function, existing `renderWithProviders`/`afterEach`/`export { i18n }` unchanged below it):

```tsx
import { act, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { initI18n, type AppLanguage } from '@/i18n';
import type { Planner } from '@/data/planners';
import { ThemeProvider } from '@/theme/ThemeContext';

// ThemeProvider and the i18n singleton both touch AsyncStorage on mount.
// The package's own Jest mock avoids the "NativeModule: AsyncStorage is
// null" crash that happens under Jest without it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

/** Minimal valid Planner fixture — pass overrides for the fields a test cares about. */
export function makePlanner(overrides?: Partial<Planner>): Planner {
  return {
    id: 'planner-1',
    name: 'Layla Events',
    city: 'riyadh',
    type: 'Wedding Planner',
    rating: 4.8,
    events: 42,
    premium: false,
    verified: true,
    from: 5000,
    seed: 3,
    blurb: 'Full-service wedding and event planning across Riyadh.',
    tags: ['weddings'],
    services: [],
    packages: [],
    ...overrides,
  };
}

/**
 * Renders through the app's real ThemeProvider/I18nextProvider — the same
 * wrapping apps/customer/src/app/_layout.tsx uses — so components exercise
 * their actual useTheme()/useIsRTL() hook chain, not a mocked one.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  await initI18n();
  await act(async () => {
    await i18n.changeLanguage(lang);
  });
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{ui}</ThemeProvider>
    </I18nextProvider>
  );
}

afterEach(async () => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

export { i18n };
```

- [ ] **Step 2: Write `FeaturedCard.test.tsx`**

Create `apps/customer/src/components/discover/FeaturedCard.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react-native';

import { makePlanner, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { FeaturedCard } from './FeaturedCard';

describe('FeaturedCard', () => {
  test('renders name, city + type, and rating', async () => {
    const planner = makePlanner({ name: 'Layla Events', city: 'riyadh', type: 'Wedding Planner', rating: 4.8 });
    const { getByText } = await renderWithProviders(<FeaturedCard planner={planner} onPress={() => {}} />);
    expect(getByText('Layla Events')).toBeTruthy();
    expect(getByText(`${en.cities.riyadh} · Wedding Planner`)).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();
  });

  test('renders the premium label only when planner.premium is true', async () => {
    const premium = makePlanner({ premium: true });
    const { getByText } = await renderWithProviders(<FeaturedCard planner={premium} onPress={() => {}} />);
    expect(getByText(`★ ${en.foundation.premium}`)).toBeTruthy();

    const notPremium = makePlanner({ premium: false });
    const { queryByText } = await renderWithProviders(<FeaturedCard planner={notPremium} onPress={() => {}} />);
    expect(queryByText(`★ ${en.foundation.premium}`)).toBeNull();
  });

  test('press calls onPress with the planner', async () => {
    const planner = makePlanner();
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<FeaturedCard planner={planner} onPress={onPress} />);
    await fireEvent.press(getByText(planner.name));
    expect(onPress).toHaveBeenCalledWith(planner);
  });
});
```

- [ ] **Step 3: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false FeaturedCard.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 4: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files (the pre-existing `test-utils.tsx` warning must still be there, and no new finding introduced by the `makePlanner` addition).

- [ ] **Step 5: Commit**

```bash
cd apps/customer
git add src/test-utils.tsx src/components/discover/FeaturedCard.test.tsx
git commit -m "Add makePlanner fixture and FeaturedCard unit tests"
```

---

## Task 9: `PlannerRow.test.tsx`

**Files:**
- Create: `apps/customer/src/components/discover/PlannerRow.test.tsx`

**Interfaces:**
- Consumes: `PlannerRow` from `./PlannerRow` (already implemented, do not modify). `makePlanner` from `@/test-utils` (from Task 8, already implemented — do not modify).

- [ ] **Step 1: Write `PlannerRow.test.tsx`**

Create `apps/customer/src/components/discover/PlannerRow.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react-native';

import { makePlanner, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { PlannerRow } from './PlannerRow';

describe('PlannerRow', () => {
  test('renders name, city + type, rating, and the from-price line', async () => {
    const planner = makePlanner({ name: 'Layla Events', city: 'riyadh', type: 'Wedding Planner', rating: 4.8, from: 5000 });
    const { getByText } = await renderWithProviders(<PlannerRow planner={planner} onPress={() => {}} />);
    expect(getByText('Layla Events')).toBeTruthy();
    expect(getByText(`${en.cities.riyadh} · Wedding Planner`)).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();
    expect(getByText(`${en.common.sar} ${(5000).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('renders the premium Badge only when planner.premium is true', async () => {
    const premium = makePlanner({ premium: true });
    const { getByText } = await renderWithProviders(<PlannerRow planner={premium} onPress={() => {}} />);
    expect(getByText(en.foundation.premium)).toBeTruthy();

    const notPremium = makePlanner({ premium: false });
    const { queryByText } = await renderWithProviders(<PlannerRow planner={notPremium} onPress={() => {}} />);
    expect(queryByText(en.foundation.premium)).toBeNull();
  });

  test('press calls onPress with the planner', async () => {
    const planner = makePlanner();
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<PlannerRow planner={planner} onPress={onPress} />);
    await fireEvent.press(getByText(planner.name));
    expect(onPress).toHaveBeenCalledWith(planner);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false PlannerRow.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/discover/PlannerRow.test.tsx
git commit -m "Add PlannerRow unit tests"
```

---

## Task 10: `CitySheet.test.tsx`

**Files:**
- Create: `apps/customer/src/components/discover/CitySheet.test.tsx`

**Interfaces:**
- Consumes: `CitySheet` from `./CitySheet` (already implemented, do not modify — including its pre-existing lint finding, see Global Constraints).

- [ ] **Step 1: Write `CitySheet.test.tsx`**

Create `apps/customer/src/components/discover/CitySheet.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { CitySheet } from './CitySheet';

/**
 * CitySheet's header row, search box, and every city row all share the same
 * `row` style object reference (flexDirection: row/row-reverse per
 * isRTL) — so a generic "find any row-reverse node" query matches many
 * unrelated rows. This walks the rendered JSON tree for the innermost `View`
 * that both contains the given text and carries a row/row-reverse
 * flexDirection, which lands on the specific city option's own Pressable.
 */
function findRowContaining(node: any, text: string): any {
  if (!node || typeof node === 'string') return null;
  const childTexts: string[] = [];
  (function collect(n: any) {
    if (typeof n === 'string') {
      childTexts.push(n);
      return;
    }
    (n.children || []).forEach(collect);
  })(node);

  const style = node.props?.style ? StyleSheet.flatten(node.props.style) : null;
  const isRow = style && (style.flexDirection === 'row' || style.flexDirection === 'row-reverse');
  if (childTexts.includes(text) && isRow && node.type === 'View') {
    for (const child of node.children || []) {
      const nested = findRowContaining(child, text);
      if (nested) return nested;
    }
    return node;
  }
  for (const child of node.children || []) {
    const found = findRowContaining(child, text);
    if (found) return found;
  }
  return null;
}

describe('CitySheet', () => {
  test('visible=false renders nothing', async () => {
    const { toJSON } = await renderWithProviders(
      <CitySheet visible={false} onSelect={() => {}} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  test('visible=true renders every real city plus "all cities", each with its translated label', async () => {
    const { queryByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />
    );
    expect(queryByText(en.cities.all)).toBeTruthy();
    expect(queryByText(en.cities.riyadh)).toBeTruthy();
    expect(queryByText(en.cities.jeddah)).toBeTruthy();
  });

  test('typing in the search field filters the list; clearing restores it', async () => {
    const { getByPlaceholderText, queryByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />
    );
    const search = getByPlaceholderText(en.discover.searchCities);

    await fireEvent.changeText(search, 'xyz-no-match');
    expect(queryByText(en.discover.noCitiesFound)).toBeTruthy();
    expect(queryByText(en.cities.riyadh)).toBeNull();

    await fireEvent.changeText(search, '');
    expect(queryByText(en.cities.riyadh)).toBeTruthy();
    expect(queryByText(en.discover.noCitiesFound)).toBeNull();
  });

  test('pressing a city calls onSelect with its key', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={onSelect} onClose={() => {}} />
    );
    await fireEvent.press(getByText(en.cities.riyadh));
    expect(onSelect).toHaveBeenCalledWith('riyadh');
  });

  test('pressing "all cities" calls onSelect with undefined', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={onSelect} onClose={() => {}} />
    );
    await fireEvent.press(getByText(en.cities.all));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  test('LTR: the Riyadh row resolves flexDirection row; RTL: row-reverse', async () => {
    const ltr = await renderWithProviders(<CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />, {
      lang: 'en',
    });
    const ltrRow = findRowContaining(ltr.toJSON(), en.cities.riyadh);
    expect(StyleSheet.flatten(ltrRow.props.style).flexDirection).toBe('row');

    const rtl = await renderWithProviders(<CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />, {
      lang: 'ar',
    });
    const rtlRow = findRowContaining(rtl.toJSON(), ar.cities.riyadh);
    expect(StyleSheet.flatten(rtlRow.props.style).flexDirection).toBe('row-reverse');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false CitySheet.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit` — expect unchanged, 12 errors, same 2 files.
Run: `cd apps/customer && npm run lint` — expect unchanged, 25 problems, same files — **including the pre-existing `CitySheet.tsx:29` finding**, which must be unchanged since `CitySheet.tsx` itself is not modified by this task.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/discover/CitySheet.test.tsx
git commit -m "Add CitySheet unit tests"
```

---

## Task 11: `DateSheet.test.tsx` + final full-suite check

**Files:**
- Create: `apps/customer/src/components/discover/DateSheet.test.tsx`

**Interfaces:**
- Consumes: `DateSheet` from `./DateSheet` (already implemented, do not modify).

- [ ] **Step 1: Write `DateSheet.test.tsx`**

Create `apps/customer/src/components/discover/DateSheet.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { DateSheet } from './DateSheet';

// DateSheet computes "today" from the real system clock — pin it for every
// test in this file so disabled/enabled-day assertions are deterministic
// regardless of the date this suite actually runs on.
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-17T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DateSheet', () => {
  const value = new Date('2026-07-17T12:00:00Z');

  test('visible=false renders nothing', async () => {
    const { toJSON } = await renderWithProviders(
      <DateSheet visible={false} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  test("visible=true renders the calendar for value's month", async () => {
    const { queryByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    expect(queryByText('July 2026')).toBeTruthy();
    expect(queryByText('17')).toBeTruthy();
  });

  test('a date before today is disabled: pressing it does not call onSelect', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={onSelect} onClose={() => {}} />
    );
    // "Today" is pinned to July 17, 2026 — July 10 is in the past.
    await fireEvent.press(getByText('10'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('pressing an enabled date calls onSelect with that date, then onClose', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { getByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={onSelect} onClose={onClose} />
    );
    await fireEvent.press(getByText('25'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const selected: Date = onSelect.mock.calls[0][0];
    expect(selected.getFullYear()).toBe(2026);
    expect(selected.getMonth()).toBe(6); // July, 0-indexed
    expect(selected.getDate()).toBe(25);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('next/prev month buttons navigate the visible month', async () => {
    const { root, queryByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    const { StyleSheet } = require('react-native');
    // The two round month-nav buttons are the only Pressables with hitSlop=8
    // sized 34x34 in the tree; JSX/query order is [prev, next] regardless of
    // language (only visual flexDirection flips, not DOM order).
    const navButtons = root!.queryAll((node: any) => {
      if (node.props?.hitSlop !== 8) return false;
      const style = node.props?.style;
      if (!style) return false;
      const flat = StyleSheet.flatten(style);
      return flat.width === 34 && flat.height === 34;
    });
    expect(navButtons).toHaveLength(2);

    await fireEvent.press(navButtons[1]); // next
    expect(queryByText('August 2026')).toBeTruthy();

    await fireEvent.press(navButtons[0]); // prev
    await fireEvent.press(navButtons[0]); // prev again
    expect(queryByText('June 2026')).toBeTruthy();
  });

  test('RTL constructs every Intl.DateTimeFormat call with the exact ar-SA-u-ca-gregory locale tag', async () => {
    const spy = jest.spyOn(globalThis.Intl, 'DateTimeFormat');
    try {
      await renderWithProviders(<DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />, {
        lang: 'ar',
      });
      expect(spy.mock.calls.length).toBeGreaterThan(0);
      const locales = new Set(spy.mock.calls.map((call) => call[0]));
      expect(locales).toEqual(new Set(['ar-SA-u-ca-gregory']));
    } finally {
      spy.mockRestore();
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false DateSheet.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Run the full suite together**

Run: `cd apps/customer && npm test -- --watchAll=false`
Expected: all 25 test files pass (14 existing + 11 from this plan), every test green, 0 failures.

- [ ] **Step 4: Re-check the tsc and lint baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged, 12 errors, same 2 files.

Run: `cd apps/customer && npm run lint`
Expected: unchanged, 25 problems, same files (including the pre-existing `CitySheet.tsx` and `test-utils.tsx` findings) — nothing new anywhere in this plan's 11 new test files or the `package.json`/`test-utils.tsx` changes.

- [ ] **Step 5: Commit**

```bash
cd apps/customer
git add src/components/discover/DateSheet.test.tsx
git commit -m "Add DateSheet unit tests"
```
