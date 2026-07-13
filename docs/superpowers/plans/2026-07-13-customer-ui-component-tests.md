# Component tests for apps/customer/src/components/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `@testing-library/react-native` and unit tests for the 10 presentational components in `apps/customer/src/components/ui/`, covering LTR and RTL rendering through the app's real `ThemeContext`/i18n providers.

**Architecture:** A shared `apps/customer/src/test-utils.tsx` module exports `renderWithProviders(ui, { lang })`, wrapping components in the real `I18nextProvider`/`ThemeProvider` exactly as the app root does. Every component test file imports this helper instead of calling `@testing-library/react-native`'s `render` directly (except `Toast.test.tsx`, which layers on an extra `SafeAreaProvider`).

**Tech Stack:** `@testing-library/react-native` (installed fresh in Task 1), `jest-expo` preset (already configured from the prior pure-logic pass).

## Global Constraints

The following was verified empirically against the exact installed versions in this repo before writing this plan (not assumed from training data, per `apps/customer/AGENTS.md`'s standing rule) — every task below depends on it:

- **`render(...)` returns a Promise in this installed `@testing-library/react-native` version — always `await` it.** `const { getByText } = await renderWithProviders(...)`, never a bare `render(...)` destructure. Omitting `await` silently yields an object with none of the query methods (`getByText` etc. become `undefined`) rather than a clear error at the call site.
- **`fireEvent.press(...)`, `fireEvent.changeText(...)`, and other `fireEvent.*` calls must also be awaited** (`await fireEvent.press(...)`) — confirmed: without `await`, the state update from the handler had not committed by the time the following assertion ran, producing a false "element not found" failure even though the handler *did* eventually run.
- **Never destructure `render` from `@testing-library/react-native` directly in a component test file.** Import `renderWithProviders` from `@/test-utils` (Task 1) instead — it wraps the real `ThemeProvider`/`I18nextProvider` the same way the app root does. The one exception is `Toast.test.tsx` (Task 10), which needs an additional `SafeAreaProvider` layer `renderWithProviders` doesn't provide.
- **Style assertions must use `StyleSheet.flatten(node.props.style)`** (import `StyleSheet` from `'react-native'`), never a manual `.find()` over a style array. React Native style arrays merge left-to-right with later entries winning on conflicting keys — several of these components (`Text`'s line-height override, `Avatar`, `Button`) intentionally rely on a later array entry overriding an earlier one, and `.find()` returns the *first* match, which is often the wrong one.
- **For a non-text prop (e.g. a gradient's `colors`) on the outermost element a render returns, read it via `result.root!.props.<propName>`.** This installed version has no `UNSAFE_getByType`/`getByType` query; `result.root` *is* the TestInstance for the top-level rendered element when that element has no wrapping host node above it. **`root` is typed `ReactTestInstance | null`, so every use needs a `!` non-null assertion** (`root!.props...`, `root!.queryAll(...)`) or `tsc --noEmit` fails — confirmed by an actual `tsc` run against this plan's own Avatar task, not assumed; every `root.` usage in the tasks below already has the `!` applied.
- **`queryAll`'s tree collapses every composite (function/class) component — only host primitives appear as nodes.** Confirmed by walking the tree directly: a Phosphor icon like `Star` never appears as a node itself, only its rendered SVG output does (`RNSVGSvgView` → `RNSVGGroup` → `RNSVGPath`); `node.type === Star` (or `=== Calendar`, `=== ImageIcon`, or any other imported component reference) always returns zero matches, never throws, so this fails silently as an empty result rather than a visible error. **Match host primitives by their string type name instead:** `node.type === 'RNSVGSvgView'` to detect "an icon rendered here" (Phosphor's universal SVG wrapper, regardless of which icon — sufficient when the test only needs to know *that* an icon rendered, not which prop values it received, since those are consumed by the collapsed composite and aren't recoverable from its host output), `node.type === 'Image'` for RN's built-in `Image`, `node.type === 'ActivityIndicator'` for RN's built-in `ActivityIndicator` — both resolve to host nodes carrying their own name, unlike third-party or in-repo composite components. Every task below that needs this already uses the string form.
- **Color values that reach a native view are converted to platform integers before a test can observe them** (confirmed: `LinearGradient`'s rendered `colors` prop is an array of numbers, not hex strings). Compare with `processColor(hexString)` (import `processColor` from `'react-native'`), never a raw hex string.
- **`i18n` (default export of `@/i18n`) is a module-level singleton shared across the whole Jest run.** `test-utils.tsx` (Task 1) resets it to `'en'` in a file-scoped `afterEach`, and every test must go through `renderWithProviders({ lang })` to change it — never call `i18n.changeLanguage(...)` directly in a test file, or the reset won't have run before the next file starts and language state will leak across files.
- No snapshot tests. No assertions on animated/interpolated values or intermediate frames.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the current baseline, and a commit.

## Task 1: `@testing-library/react-native` setup + shared `test-utils.tsx` + `Avatar.test.tsx`

**Files:**
- Modify: `apps/customer/package.json`, `apps/customer/package-lock.json` (via install)
- Create: `apps/customer/src/test-utils.tsx`
- Create: `apps/customer/src/components/ui/Avatar.test.tsx`

**Interfaces:**
- Produces: `renderWithProviders(ui: ReactElement, options?: { lang?: 'en' | 'ar' }): Promise<RenderResult>` from `@/test-utils` — every later task in this plan imports this.

- [ ] **Step 1: Install the testing library**

```bash
cd apps/customer
npx expo install @testing-library/react-native --dev
```

This is the current Expo-SDK-56-recommended install path (confirmed live against `https://docs.expo.dev/develop/unit-testing/`). No `moduleNameMapper` config is needed for the `@/` path alias — confirmed empirically that Jest already resolves it the same way Metro does in this project. No `jest-native`/matcher package is needed — this version bundles its own Jest matchers.

- [ ] **Step 2: Write the shared test-utils module**

Create `apps/customer/src/test-utils.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { initI18n, type AppLanguage } from '@/i18n';
import { ThemeProvider } from '@/theme/ThemeContext';

// ThemeProvider and the i18n singleton both touch AsyncStorage on mount.
// The package's own Jest mock avoids the "NativeModule: AsyncStorage is
// null" crash that happens under Jest without it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

/**
 * Renders through the app's real ThemeProvider/I18nextProvider — the same
 * wrapping apps/customer/src/app/_layout.tsx uses — so components exercise
 * their actual useTheme()/useIsRTL() hook chain, not a mocked one.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  await initI18n();
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

- [ ] **Step 3: Write `Avatar.test.tsx`**

Create `apps/customer/src/components/ui/Avatar.test.tsx`:

```tsx
import { StyleSheet, processColor } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { colors } from '@/theme/colors';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('renders the given initials', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="AB" />);
    expect(getByText('AB')).toBeTruthy();
  });

  test('seed selects the matching gradient pair', async () => {
    const { root } = await renderWithProviders(<Avatar initials="GH" seed={3} />);
    expect(root!.props.colors).toEqual([processColor(colors.gold500), processColor(colors.purple500)]);
  });

  test('seed wraps around with modulo when it exceeds the gradient count', async () => {
    // gradients has 6 entries (indices 0-5); seed 8 % 6 === 2 -> [lavender300, purple500].
    const { root } = await renderWithProviders(<Avatar initials="IJ" seed={8} />);
    expect(root!.props.colors).toEqual([processColor(colors.lavender300), processColor(colors.purple500)]);
  });

  test('LTR renders the initials in the Latin bold font', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="KL" />);
    const fontFamily = StyleSheet.flatten(getByText('KL').props.style).fontFamily;
    expect(fontFamily).toBe('Poppins_700Bold');
  });

  test('RTL renders the initials in the Arabic bold font', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="MN" />, { lang: 'ar' });
    const fontFamily = StyleSheet.flatten(getByText('MN').props.style).fontFamily;
    expect(fontFamily).toBe('Tajawal_700Bold');
  });
});
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Avatar.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 5: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: matches the existing baseline from the pure-logic pass — 13 errors, all in `src/app/(tabs)/profile.tsx`, `src/app/_layout.tsx`, `src/app/notifications.tsx`. Nothing in `test-utils.tsx` or `Avatar.test.tsx`.

- [ ] **Step 6: Commit**

```bash
cd apps/customer
git add package.json package-lock.json src/test-utils.tsx src/components/ui/Avatar.test.tsx
git commit -m "Add @testing-library/react-native, shared test-utils, and Avatar tests"
```

---

## Task 2: `Badge.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Badge.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Badge`/`Stars` from `./Badge` (already implemented, do not modify).

- [ ] **Step 1: Write `Badge.test.tsx`**

Create `apps/customer/src/components/ui/Badge.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Star } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import { Badge, Stars } from './Badge';

describe('Badge', () => {
  test('renders the children text', async () => {
    const { getByText } = await renderWithProviders(<Badge>Featured</Badge>);
    expect(getByText('Featured')).toBeTruthy();
  });

  test('renders an icon (as an SVG) when provided', async () => {
    const { root } = await renderWithProviders(<Badge icon={Star}>Top rated</Badge>);
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('omits the icon when not provided', async () => {
    const { root } = await renderWithProviders(<Badge>No icon</Badge>);
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(0);
  });

  test('LTR container flexDirection is row', async () => {
    const { getByText } = await renderWithProviders(<Badge>Row</Badge>);
    const containerStyle = StyleSheet.flatten(getByText('Row').parent!.props.style);
    expect(containerStyle.flexDirection).toBe('row');
  });

  test('RTL container flexDirection is row-reverse', async () => {
    const { getByText } = await renderWithProviders(<Badge>Row</Badge>, { lang: 'ar' });
    const containerStyle = StyleSheet.flatten(getByText('Row').parent!.props.style);
    expect(containerStyle.flexDirection).toBe('row-reverse');
  });
});

describe('Stars', () => {
  test('renders the rating wrapped in a Badge with a star icon', async () => {
    const { getByText, root } = await renderWithProviders(<Stars rating={4.8} />);
    expect(getByText('4.8')).toBeTruthy();
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('coerces a numeric rating to its string form', async () => {
    const { getByText } = await renderWithProviders(<Stars rating={5} />);
    expect(getByText('5')).toBeTruthy();
  });
});
```

**Why `'RNSVGSvgView'` instead of matching `Star` by reference:** confirmed empirically (via a task that hit this and correctly reported BLOCKED rather than guessing) that this `TestInstance` tree model collapses composite/function components entirely — only host primitives appear as nodes, identified by string type names. `Star` (like every Phosphor icon, and like any plain function component) never appears as a distinct node; only its rendered SVG output does (`RNSVGSvgView` → `RNSVGGroup` → `RNSVGPath`, confirmed by walking `.children` directly). `RNSVGSvgView` is Phosphor's universal SVG wrapper regardless of which icon, so its presence/absence is a correct, general proxy for "an icon renders here" — which is what `Badge`'s and `Stars`'s own conditional-rendering logic (`{IconComp && <IconComp .../>}`) actually does. The original design intent to also verify `weight === 'fill'` isn't preserved — that prop is consumed by the collapsed composite and isn't recoverable from the host SVG output without coupling the test to Phosphor's internal fill-vs-stroke SVG implementation, which would make it fragile rather than meaningful.

**Note:** `getByText('Row').parent` gives the immediate parent TestInstance of the text node — confirmed empirically that for `Badge` this resolves directly to the styled `View` in a single hop (no intermediate wrapper), so the code above is expected to just work as written.

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Badge.test`
Expected: all 7 tests pass, 0 failures. If the `flexDirection` assertions fail, apply the fix described in the note above, re-run, and only proceed once genuinely passing (don't loosen the assertion to something that no longer checks direction).

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Badge.test.tsx
git commit -m "Add Badge/Stars unit tests"
```

---

## Task 3: `Card.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Card.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Card` from `./Card` (already implemented, do not modify).

- [ ] **Step 1: Write `Card.test.tsx`**

Create `apps/customer/src/components/ui/Card.test.tsx`:

```tsx
import { StyleSheet, Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { Card } from './Card';

describe('Card', () => {
  test('renders children', async () => {
    const { getByText } = await renderWithProviders(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  test('default (not elevated) applies the sm shadow', async () => {
    const { root } = await renderWithProviders(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    // shadows.sm has shadowOpacity 0.07; shadows.md has 0.16 — distinct enough to assert directly.
    expect(style.shadowOpacity).toBeCloseTo(0.07);
  });

  test('elevated applies the md shadow', async () => {
    const { root } = await renderWithProviders(
      <Card elevated>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.shadowOpacity).toBeCloseTo(0.16);
  });

  test('background and border colors come from the active theme', async () => {
    const { root } = await renderWithProviders(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    // Default theme mode is 'system'; RN's useColorScheme() resolves to
    // undefined/light under Jest, so the light theme applies (bgSurface: '#FFFFFF', border: '#E9E1EE').
    expect(style.backgroundColor).toBe('#FFFFFF');
    expect(style.borderColor).toBe('#E9E1EE');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Card.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Card.test.tsx
git commit -m "Add Card unit tests"
```

---

## Task 4: `EmptyState.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/EmptyState.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `EmptyState` from `./EmptyState` (already implemented, do not modify).

- [ ] **Step 1: Write `EmptyState.test.tsx`**

Create `apps/customer/src/components/ui/EmptyState.test.tsx`:

```tsx
import { Text } from 'react-native';
import { Calendar } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  test('always renders the icon and title', async () => {
    const { getByText, root } = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(getByText('No requests yet')).toBeTruthy();
    // Composite/function components (including every Phosphor icon) don't appear as
    // distinct nodes in this TestInstance tree — only their rendered host output does.
    // 'RNSVGSvgView' is Phosphor's universal SVG wrapper regardless of which icon, so its
    // presence is the correct proxy for "an icon rendered here" (confirmed empirically —
    // see the equivalent note in Task 2).
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('renders the subtitle only when provided', async () => {
    const withSubtitle = await renderWithProviders(
      <EmptyState icon={Calendar} title="No requests yet" subtitle="Post your first request to get started" />
    );
    expect(withSubtitle.getByText('Post your first request to get started')).toBeTruthy();

    const withoutSubtitle = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(withoutSubtitle.queryByText('Post your first request to get started')).toBeNull();
  });

  test('renders children only when provided', async () => {
    const withChildren = await renderWithProviders(
      <EmptyState icon={Calendar} title="No requests yet">
        <Text>Retry</Text>
      </EmptyState>
    );
    expect(withChildren.getByText('Retry')).toBeTruthy();

    const withoutChildren = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(withoutChildren.queryByText('Retry')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false EmptyState.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/EmptyState.test.tsx
git commit -m "Add EmptyState unit tests"
```

---

## Task 5: `Text.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Text.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Text`/`AccentText` from `./Text`, `getTextStyle`/`getDisplayItalicFont` from `@/theme/typography`, `lightTheme` from `@/theme/colors` (already implemented, do not modify).

- [ ] **Step 1: Write `Text.test.tsx`**

Create `apps/customer/src/components/ui/Text.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { getDisplayItalicFont, getTextStyle } from '@/theme/typography';
import { AccentText, Text } from './Text';

describe('Text', () => {
  test('h1 variant matches getTextStyle output', async () => {
    const { getByText } = await renderWithProviders(<Text variant="h1">Heading</Text>);
    const style = StyleSheet.flatten(getByText('Heading').props.style);
    const expected = getTextStyle('h1', false, lightTheme);
    expect(style.fontFamily).toBe(expected.fontFamily);
    expect(style.fontSize).toBe(expected.fontSize);
    expect(style.lineHeight).toBe(expected.lineHeight);
  });

  test('caption variant matches getTextStyle output', async () => {
    const { getByText } = await renderWithProviders(<Text variant="caption">Small print</Text>);
    const style = StyleSheet.flatten(getByText('Small print').props.style);
    const expected = getTextStyle('caption', false, lightTheme);
    expect(style.fontFamily).toBe(expected.fontFamily);
    expect(style.fontSize).toBe(expected.fontSize);
    expect(style.color).toBe(expected.color);
  });

  // Regression guard documented directly in Text.tsx's own comment: a
  // caller-provided lineHeight is tuned for English and is too tight for
  // Arabic, so it must be dropped (not just overridden) in RTL, while it's
  // kept as-is in LTR.
  test('LTR keeps a caller-provided lineHeight override', async () => {
    const { getByText } = await renderWithProviders(
      <Text style={{ lineHeight: 28 }}>Custom line height</Text>
    );
    const style = StyleSheet.flatten(getByText('Custom line height').props.style);
    expect(style.lineHeight).toBe(28);
  });

  test('RTL drops a caller-provided lineHeight override', async () => {
    const { getByText } = await renderWithProviders(
      <Text style={{ lineHeight: 28 }}>تخصيص</Text>,
      { lang: 'ar' }
    );
    const style = StyleSheet.flatten(getByText('تخصيص').props.style);
    const expected = getTextStyle('body', true, lightTheme);
    expect(style.lineHeight).toBe(expected.lineHeight);
    expect(style.lineHeight).not.toBe(28);
  });
});

describe('AccentText', () => {
  test('LTR resolves the italic display font and the brand color', async () => {
    const { getByText } = await renderWithProviders(<AccentText>perfect</AccentText>);
    const style = StyleSheet.flatten(getByText('perfect').props.style);
    expect(style.fontFamily).toBe(getDisplayItalicFont('semibold', false));
    expect(style.color).toBe(lightTheme.brand);
  });

  test('RTL resolves the Arabic display semibold font (no italic variant) and the brand color', async () => {
    const { getByText } = await renderWithProviders(<AccentText>مثالي</AccentText>, { lang: 'ar' });
    const style = StyleSheet.flatten(getByText('مثالي').props.style);
    expect(style.fontFamily).toBe(getDisplayItalicFont('semibold', true));
    expect(style.color).toBe(lightTheme.brand);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Text.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Text.test.tsx
git commit -m "Add Text/AccentText unit tests"
```

---

## Task 6: `Photo.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Photo.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Photo` from `./Photo` (already implemented, do not modify).

- [ ] **Step 1: Write `Photo.test.tsx`**

Create `apps/customer/src/components/ui/Photo.test.tsx`:

```tsx
import { StyleSheet, Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { Photo } from './Photo';

/** Photo's label badge sits in a View with both a `top` and a left/right key — the only such node in the tree. */
function findPositionedWrapper(root: any) {
  return root.queryAll((node: any) => {
    const style = node.props?.style;
    return !!style && typeof style === 'object' && 'top' in style && ('left' in style || 'right' in style);
  })[0];
}

describe('Photo', () => {
  test('uri set: renders an Image with that source', async () => {
    const { root } = await renderWithProviders(<Photo uri="https://img.example/1.jpg" />);
    // RN's built-in Image resolves to a host node identified by the string 'Image' in this
    // TestInstance tree (unlike composite/function components, which don't appear as nodes
    // at all — see the equivalent note in Task 2 for why component-reference matching
    // wouldn't work here).
    const images = root!.queryAll((node: any) => node.type === 'Image');
    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual({ uri: 'https://img.example/1.jpg' });
  });

  test('uri unset: renders the gradient placeholder with the fallback icon, no Image', async () => {
    const { root } = await renderWithProviders(<Photo />);
    expect(root!.queryAll((node: any) => node.type === 'Image')).toHaveLength(0);
    // ImageIcon (a Phosphor icon, a composite component) never appears as a node itself —
    // only its rendered 'RNSVGSvgView' output does.
    expect(root!.queryAll((node: any) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('LTR positions the label badge with a left key, no right key', async () => {
    const { root } = await renderWithProviders(<Photo label="Featured" />);
    const wrapper = findPositionedWrapper(root);
    const style = StyleSheet.flatten(wrapper.props.style);
    expect(style.left).toBe(8);
    expect(style.right).toBeUndefined();
  });

  test('RTL positions the label badge with a right key, no left key', async () => {
    const { root } = await renderWithProviders(<Photo label="Featured" />, { lang: 'ar' });
    const wrapper = findPositionedWrapper(root);
    const style = StyleSheet.flatten(wrapper.props.style);
    expect(style.right).toBe(8);
    expect(style.left).toBeUndefined();
  });

  test('children render through in both the uri and placeholder branches', async () => {
    const withUri = await renderWithProviders(
      <Photo uri="https://img.example/1.jpg">
        <Text>Overlay</Text>
      </Photo>
    );
    expect(withUri.getByText('Overlay')).toBeTruthy();

    const placeholder = await renderWithProviders(
      <Photo>
        <Text>Overlay</Text>
      </Photo>
    );
    expect(placeholder.getByText('Overlay')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Photo.test`
Expected: all 5 tests pass, 0 failures. If `findPositionedWrapper` doesn't locate the expected node (e.g. `wrapper` is `undefined`), log `JSON.stringify(root.toJSON(), null, 2)` to see the actual tree and adjust the predicate to the real shape — don't guess further, confirm against the printed tree.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Photo.test.tsx
git commit -m "Add Photo unit tests"
```

---

## Task 7: `Button.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Button` from `./Button` (already implemented, do not modify).

- [ ] **Step 1: Write `Button.test.tsx`**

Create `apps/customer/src/components/ui/Button.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { Button } from './Button';

describe('Button', () => {
  test('renders the label text', async () => {
    const { getByText } = await renderWithProviders(<Button>Continue</Button>);
    expect(getByText('Continue')).toBeTruthy();
  });

  test('fires onPress when not disabled or loading', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<Button onPress={onPress}>Continue</Button>);
    await fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('disabled: does not fire onPress and reports accessibilityState.disabled', async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await renderWithProviders(
      <Button onPress={onPress} disabled>Continue</Button>
    );
    await fireEvent.press(getByText('Continue'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
  });

  test('loading: renders an ActivityIndicator instead of the label, and reports accessibilityState.busy', async () => {
    const { root, queryByText, getByRole } = await renderWithProviders(<Button loading>Continue</Button>);
    expect(queryByText('Continue')).toBeNull();
    // RN's built-in ActivityIndicator resolves to a host node identified by the string
    // 'ActivityIndicator' in this TestInstance tree (see the equivalent note in Task 2/6
    // for why component-reference matching doesn't work here).
    expect(root!.queryAll((node: any) => node.type === 'ActivityIndicator')).toHaveLength(1);
    expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  });

  test('LTR: inner row is flexDirection row, label uses the Latin bold font', async () => {
    const { getByText } = await renderWithProviders(<Button>Continue</Button>);
    const label = getByText('Continue');
    const rowStyle = StyleSheet.flatten(label.parent!.props.style);
    expect(rowStyle.flexDirection).toBe('row');
    expect(StyleSheet.flatten(label.props.style).fontFamily).toBe('Poppins_700Bold');
  });

  test('RTL: inner row is flexDirection row-reverse, label uses the Arabic bold font', async () => {
    const { getByText } = await renderWithProviders(<Button>متابعة</Button>, { lang: 'ar' });
    const label = getByText('متابعة');
    const rowStyle = StyleSheet.flatten(label.parent!.props.style);
    expect(rowStyle.flexDirection).toBe('row-reverse');
    expect(StyleSheet.flatten(label.props.style).fontFamily).toBe('Tajawal_700Bold');
  });
});
```

**Note:** as in Task 2, `label.parent` gives the immediate parent TestInstance — if it doesn't resolve to the `flexDirection`-styled row `View` (e.g. because an intermediate `Text`-wrapper component sits between them), log `JSON.stringify(root.toJSON(), null, 2)` and adjust to the correct number of `.parent` hops. Don't guess further, confirm against the printed tree.

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Button.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Button.test.tsx
git commit -m "Add Button unit tests"
```

---

## Task 8: `Input.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Input.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Input` from `./Input` (already implemented, do not modify). Reads the real translated string from `apps/customer/src/i18n/locales/en.json`/`ar.json`'s `common.togglePasswordVisibility` key directly, rather than duplicating it, so the test can't silently drift from the real translation.

- [ ] **Step 1: Write `Input.test.tsx`**

Create `apps/customer/src/components/ui/Input.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { Eye } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { Input } from './Input';

describe('Input', () => {
  test('renders the label when provided', async () => {
    const { getByText } = await renderWithProviders(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  test('omits the label row when not provided', async () => {
    const { queryByText } = await renderWithProviders(<Input placeholder="Email" />);
    expect(queryByText('Email')).toBeNull();
  });

  test('typing fires onChangeText with the typed value', async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await renderWithProviders(<Input label="Email" onChangeText={onChangeText} />);
    await fireEvent.changeText(getByLabelText('Email'), 'a@b.com');
    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  test('focus and blur toggle the focused border color', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />);
    const field = getByLabelText('Email');
    const unfocused = StyleSheet.flatten(field.parent!.props.style);
    expect(unfocused.borderColor).toBe('#D8CDE0'); // theme.borderStrong

    await fireEvent(field, 'focus');
    const focused = StyleSheet.flatten(field.parent!.props.style);
    expect(focused.borderColor).toBe('#4B0082'); // theme.brand
  });

  test('an error overrides the border color and renders the error message', async () => {
    const { getByLabelText, getByText } = await renderWithProviders(
      <Input label="Email" error="Required" />
    );
    const style = StyleSheet.flatten(getByLabelText('Email').parent!.props.style);
    expect(style.borderColor).toBe('#C24436'); // theme.danger
    expect(getByText('Required')).toBeTruthy();
  });

  test('pressing the trailing icon calls onTrailingIconPress once', async () => {
    const onTrailingIconPress = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Input label="Password" trailingIcon={Eye} onTrailingIconPress={onTrailingIconPress} />
    );
    await fireEvent.press(getByRole('button'));
    expect(onTrailingIconPress).toHaveBeenCalledTimes(1);
  });

  test('LTR: row is flexDirection row, textAlign left', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />);
    const field = getByLabelText('Email');
    expect(StyleSheet.flatten(field.parent!.props.style).flexDirection).toBe('row');
    expect(StyleSheet.flatten(field.props.style).textAlign).toBe('left');
  });

  test('RTL: row is flexDirection row-reverse, textAlign right', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />, { lang: 'ar' });
    const field = getByLabelText('Email');
    expect(StyleSheet.flatten(field.parent!.props.style).flexDirection).toBe('row-reverse');
    expect(StyleSheet.flatten(field.props.style).textAlign).toBe('right');
  });

  test('the trailing-icon button accessibilityLabel uses the real translated string per locale', async () => {
    const enResult = await renderWithProviders(
      <Input label="Password" trailingIcon={Eye} onTrailingIconPress={() => {}} />
    );
    expect(enResult.getByLabelText(en.common.togglePasswordVisibility)).toBeTruthy();

    const arResult = await renderWithProviders(
      <Input label="كلمة المرور" trailingIcon={Eye} onTrailingIconPress={() => {}} />,
      { lang: 'ar' }
    );
    expect(arResult.getByLabelText(ar.common.togglePasswordVisibility)).toBeTruthy();
  });
});
```

**Note:** the focus/blur and error-color assertions read `field.parent!.props.style` (the row `View` immediately wrapping the `TextInput`) — confirm against `Input.tsx`'s structure (the `TextInput` is a direct child of the styled row `View`) once the test runs; if `getByLabelText('Email')` resolves to something other than the `TextInput` host node directly, adjust accordingly using the same "print `root.toJSON()` and confirm" approach as earlier tasks.

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Input.test`
Expected: all 9 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Input.test.tsx
git commit -m "Add Input unit tests"
```

---

## Task 9: `Skeleton.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Skeleton.test.tsx`

**Interfaces:**
- Consumes: `renderWithProviders` from `@/test-utils` (Task 1). `Skeleton`/`SkeletonRow`/`SkeletonCard` from `./Skeleton` (already implemented, do not modify).

- [ ] **Step 1: Write `Skeleton.test.tsx`**

Create `apps/customer/src/components/ui/Skeleton.test.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { Skeleton, SkeletonCard, SkeletonRow } from './Skeleton';

describe('Skeleton', () => {
  test('reflects width/height/radius in style, with the themed background color', async () => {
    const { root } = await renderWithProviders(<Skeleton width={120} height={20} radius={8} />);
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.width).toBe(120);
    expect(style.height).toBe(20);
    expect(style.borderRadius).toBe(8);
    expect(style.backgroundColor).toBe('#F4F0EA'); // theme.bgSunken
  });

  test('defaults width to 100% and height to 14 when not provided', async () => {
    const { root } = await renderWithProviders(<Skeleton />);
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.width).toBe('100%');
    expect(style.height).toBe(14);
  });
});

describe('SkeletonRow', () => {
  test('renders children in a row container with the given gap', async () => {
    const { root } = await renderWithProviders(
      <SkeletonRow gap={16}>
        <Text>One</Text>
        <Text>Two</Text>
      </SkeletonRow>
    );
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.flexDirection).toBe('row');
    expect(style.gap).toBe(16);
  });
});

describe('SkeletonCard', () => {
  test('renders children inside a themed container', async () => {
    const { root, getByText } = await renderWithProviders(
      <SkeletonCard>
        <Text>Loading placeholder</Text>
      </SkeletonCard>
    );
    expect(getByText('Loading placeholder')).toBeTruthy();
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.backgroundColor).toBe('#FFFFFF'); // theme.bgSurface
    expect(style.borderColor).toBe('#E9E1EE'); // theme.border
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Skeleton.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 4: Commit**

```bash
cd apps/customer
git add src/components/ui/Skeleton.test.tsx
git commit -m "Add Skeleton/SkeletonRow/SkeletonCard unit tests"
```

---

## Task 10: `Toast.test.tsx`

**Files:**
- Create: `apps/customer/src/components/ui/Toast.test.tsx`

**Interfaces:**
- Consumes: `i18n`/`renderWithProviders`'s underlying pieces are NOT reused wholesale here — `Toast` needs an extra `SafeAreaProvider` layer, so this file builds its own wrapper directly rather than using `@/test-utils`'s `renderWithProviders` (see Step 1). `ToastProvider`/`useToast` from `./Toast` (already implemented, do not modify).

The following was verified empirically before writing this task, because it directly contradicts what would otherwise be a reasonable guess:

- **Using `react-native-safe-area-context`'s own official Jest mock (`jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock'))`) crashes** with `TypeError: Cannot read properties of undefined (reading 'displayName')`, thrown from `react-native-css-interop`'s `wrap-jsx.ts`. NativeWind's CSS interop (this project uses `jsxImportSource: 'nativewind'`, per `babel.config.js`) has special-cased handling for `react-native-safe-area-context`'s real exports, and replacing the whole module breaks that. **Use the real `SafeAreaProvider` with an explicit `initialMetrics` prop instead** (Step 1) — this works cleanly and doesn't touch the module registry.
- **`ToastProvider`'s `show()` schedules a real `setTimeout(..., 3200)` to auto-dismiss.** Without `jest.useFakeTimers()`, this timer fires for real, 3.2 real seconds later — often *after* the test file has finished and Jest has torn down the environment, which crashes the whole test process (`ReferenceError: You are trying to import a file after the Jest environment has been torn down`, then an unhandled `TypeError` from the resulting broken module reference). **Every test in this file that calls `show()` must use `jest.useFakeTimers()`, and every test must restore real timers in `afterEach`** (Step 1) — this is a correctness requirement to prevent process crashes, not an optional nicety.
- Despite that risk, the animation *does* complete correctly under fake timers: `Animated.timing(...).start(callback)`'s completion callback reliably fires when wrapped in `await act(async () => { jest.advanceTimersByTime(N) })`. The auto-dismiss and manual-dismiss paths are testable for real — they don't need to be skipped.

- [ ] **Step 1: Write `Toast.test.tsx`**

Create `apps/customer/src/components/ui/Toast.test.tsx`:

```tsx
import { render, fireEvent, act } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/test-utils';
import { initI18n } from '@/i18n';
import { ThemeProvider } from '@/theme/ThemeContext';
import { Text } from './Text';
import { ToastProvider, useToast } from './Toast';

const TEST_METRICS = {
  frame: { width: 320, height: 640, x: 0, y: 0 },
  insets: { left: 0, right: 0, top: 0, bottom: 0 },
};

function Probe({ tone = 'success' as 'success' | 'error' | 'info' }) {
  const { show } = useToast();
  return (
    <Pressable testID="trigger" onPress={() => show('Hello there', tone)}>
      <Text>trigger</Text>
    </Pressable>
  );
}

async function renderToast(tone?: 'success' | 'error' | 'info') {
  await initI18n();
  await i18n.changeLanguage('en');
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={TEST_METRICS}>
          <ToastProvider>
            <Probe tone={tone} />
          </ToastProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('ToastProvider', () => {
  test('show() renders the message text', async () => {
    jest.useFakeTimers();
    const { getByTestId, getByText } = await renderToast();
    await fireEvent.press(getByTestId('trigger'));
    expect(getByText('Hello there')).toBeTruthy();
  });

  test('keeps only the last 3 toasts when shown more than 3 times', async () => {
    jest.useFakeTimers();
    const { getByTestId, queryByText, queryAllByText } = await renderToast();
    const trigger = getByTestId('trigger');
    await fireEvent.press(trigger); // 1st — will be evicted
    await fireEvent.press(trigger);
    await fireEvent.press(trigger);
    await fireEvent.press(trigger); // 4th
    // All 4 calls used the same message text, so assert count rather than distinct content.
    expect(queryAllByText('Hello there')).toHaveLength(3);
  });

  test('auto-dismisses 3200ms after being shown', async () => {
    jest.useFakeTimers();
    const { getByTestId, queryByText } = await renderToast();
    await fireEvent.press(getByTestId('trigger'));
    expect(queryByText('Hello there')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(3200 + 200 + 50); // + the 200ms dismiss animation + margin
    });
    expect(queryByText('Hello there')).toBeNull();
  });
});
```

**Note on the "last 3 toasts" test:** every call uses the same message text ("Hello there"), so `queryAllByText` returning exactly 3 matches is what proves the 4th eviction happened (if eviction were broken, either the count would be higher, or if the toast state update failed entirely it'd be lower/zero) — this doesn't distinguish *which* of the 4 was evicted, only that exactly 3 remain. That's sufficient for what `ToastProvider`'s `prev.slice(-2)` logic guarantees (keep the most recent 3); a stronger per-item identity assertion would need distinct message text per call, which isn't necessary here.

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/customer && npm test -- --watchAll=false Toast.test`
Expected: all 3 tests pass, 0 failures, and no `ReferenceError`/`TypeError` output after the test summary (that output would indicate a leaked real timer — if you see it, a test is missing `jest.useFakeTimers()` or the `afterEach` cleanup isn't running).

- [ ] **Step 3: Run the full suite together**

Run: `cd apps/customer && npm test -- --watchAll=false`
Expected: all 14 test files (4 from the pure-logic pass + 10 from this plan) pass, every test across all of them green, 0 failures, no leaked-timer errors after the summary.

- [ ] **Step 4: Re-check the tsc baseline**

Run: `cd apps/customer && npx tsc --noEmit`
Expected: unchanged 13-error baseline.

- [ ] **Step 5: Lint check**

Run: `cd apps/customer && npm run lint`
Expected: no new lint errors on any of the 10 new test files or `test-utils.tsx` (pre-existing findings elsewhere are not this plan's concern).

- [ ] **Step 6: Commit**

```bash
cd apps/customer
git add src/components/ui/Toast.test.tsx
git commit -m "Add Toast/ToastProvider unit tests"
```
