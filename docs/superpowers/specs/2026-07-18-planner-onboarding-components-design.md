# Test coverage for apps/planner's app/onboarding/_components/ — design

Date: 2026-07-18

## Problem

`apps/planner`'s `app/onboarding/_components/` directory (12 files backing the 5-step planner onboarding wizard) has zero test coverage — none of these files appear in the coverage report. Unlike `components/layout/` (the prior test-coverage pass), none of these components touch Supabase, `AuthContext`, or routing — that orchestration lives one level up in `app/onboarding/page.tsx`, which is out of scope here.

## Scope

In scope: 11 of the 12 files in `apps/planner/src/app/onboarding/_components/`:
- Primitives: `Chip.tsx`, `Field.tsx`, `TextInput.tsx`, `StepHead.tsx`, `BrandRail.tsx`.
- Step forms: `StepAccount.tsx`, `StepBusiness.tsx`, `StepServices.tsx`, `StepVerify.tsx`, `StepPortfolio.tsx`.
- `PendingState.tsx` (the post-submit "application pending" screen).

Explicitly out of scope:
- `types.ts` — only an interface (`OnboardingForm`) and a constant (`INITIAL_FORM`); no logic to test. Used as a fixture by the tests above instead.
- `app/onboarding/page.tsx` — the orchestrating parent (Supabase signup, step navigation, `AuthContext`/router usage). A separate follow-up if pursued, closer in shape to the `components/layout/` pass than this one.
- Snapshot testing, visual/screenshot regression testing.

## Design

### 1. No new shared infrastructure needed

Every component here reads only `useTranslation()` (some also read simple `form`/`onChange` props) — `renderWithI18n` (already established, used throughout the `components/ui/` pass) covers all 11 files. None of them need `renderWithProviders`, `mockSupabaseFrom`, or a mocked `useAuth`/`next/navigation` — the entire `components/layout/`-specific infrastructure is irrelevant here.

### 2. One local fix, scoped to a single file

`StepPortfolio.tsx` calls `URL.createObjectURL(file)` (inside a `useMemo` over `form.portfolioFiles`) and `URL.revokeObjectURL(url)` (in a cleanup effect). Confirmed empirically: jsdom does not implement either (`typeof URL.createObjectURL === 'undefined'` by default in this test environment). Since `.map()` over an empty `portfolioFiles` array never invokes the callback, the default (empty) state renders fine without a polyfill — but any test exercising the "has photos" state needs one.

Unlike `matchMedia` (needed broadly by `ThemeProvider`, added globally to `jest.setup.ts` in the `components/layout/` pass), only this one component in this one file needs `createObjectURL`/`revokeObjectURL` — so `StepPortfolio.test.tsx` assigns a local mock directly, scoped to that file, rather than growing the global setup:

```ts
(global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');
(global as any).URL.revokeObjectURL = jest.fn();
```

Confirmed empirically this works for both the file-input-change flow (`fireEvent.change(fileInput, { target: { files: [file] } })` correctly triggers `addFiles` → the expected `onChange` patch) and rendering with a pre-populated `portfolioFiles` array (the preview `<img>` renders, `createObjectURL` is called with the file).

### 3. `returnObjects: true` translation arrays are real, not mocked

`StepBusiness`/`StepServices` read `t('...Options', { returnObjects: true })` to get an array of chip labels. Confirmed empirically against the real `en.json` resources (`onboarding.business.teamSizeOptions`, `yearsOptions`, `onboarding.services.budgetTierOptions` are all real string arrays) that `renderWithI18n` resolves these correctly — tests assert on the real rendered label text, not a mocked array.

### 4. Per-component test cases

**`Chip.test.tsx`** — renders children text; `on={true}` applies the active (brand/purple) classes, `on={false}` the inactive ones; renders the optional `icon` only when provided; `onClick` fires on press.

**`Field.test.tsx`** — renders `label` and `children`; renders `hint` only when provided.

**`TextInput.test.tsx`** — renders the optional `icon`; native input attributes (`value`, `onChange`, `type`, `placeholder`) pass through via `...rest`.

**`StepHead.test.tsx`** — renders `title` and `subtitle`.

**`BrandRail.test.tsx`** — for a given `step`/`done` combination, the right step renders as "active" (filled circle, bold label), earlier steps (or all steps when `done`) render as "done" (check icon), later steps render as "todo" — assert via rendered class/icon presence, not snapshot. Real translated step labels (`onboarding.steps.*`).

**`StepAccount.test.tsx`** — each field (`businessName`, `fullName`, `phone`, `email`, `password`) renders the current `form` value and fires `onChange` with the correct single-key patch (e.g. `{ businessName: 'x' }`) on input.

**`StepVerify.test.tsx`** — `crNumber` field same as above; the terms checkbox reflects `form.agreedToTerms` (checked-state styling) and toggles it via `onChange({ agreedToTerms: !agreedToTerms })` on click.

**`StepBusiness.test.tsx`** — city/team-size/years chips render the real translated/option labels, each fires the right single-value `onChange` patch, and the currently-selected chip (matching `form.city`/`teamSize`/`yearsInBusiness`) renders with the active state; the `bio` textarea passes through value/onChange.

**`StepServices.test.tsx`** — category chips toggle in and out of the `form.categories` array (both directions — adding and removing), budget-tier chips single-select the same way as `StepBusiness`, `startingPrice` numeric input passes through.

**`StepPortfolio.test.tsx`** — empty state renders the "add photo" tile, no previews; selecting a file via the hidden input calls `onChange` with the appended file; a pre-populated `portfolioFiles` renders a preview per file (using the local `createObjectURL` mock from Design section 2) and the correct count text; removing a photo calls `onChange` with that file filtered out; the "add more" tile disappears once `portfolioFiles.length === MAX_PORTFOLIO_PHOTOS` (8).

**`PendingState.test.tsx`** — renders `businessName` interpolated into the real translated subtitle string; checklist items render their done/active/todo states (icon + text style); the "in review" badge renders only on the active item; the primary button fires `onGoLive` on click.

### 5. Verification

- `npm test -- --watchAll=false` (all 11 new files, plus the 17 existing) passes with zero failures.
- `npx tsc --noEmit` and `npm run lint` stay at whatever `apps/planner`'s baseline is at implementation time (re-confirm exact counts then, the same way every prior task in this project has).

## Non-goals (explicit)

- No coverage-percentage threshold/enforcement.
- No CI wiring.
- No snapshot tests.
- No testing of `app/onboarding/page.tsx` (the orchestrating parent).
- No modification of any of the 11 components' source files.
