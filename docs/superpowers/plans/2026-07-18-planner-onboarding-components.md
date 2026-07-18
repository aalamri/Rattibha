# Test coverage for apps/planner's app/onboarding/_components/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for all 11 real components in `apps/planner/src/app/onboarding/_components/` (excluding `types.ts`, which has no logic) — currently at zero coverage.

**Architecture:** Unlike the prior `components/layout/` pass, none of these 11 components touch Supabase, `AuthContext`, or routing — that orchestration lives in the parent `app/onboarding/page.tsx`, out of scope here. `renderWithI18n` (already established) covers every component that needs i18n; the trivial primitives (`Chip`, `Field`, `TextInput`, `StepHead`) don't even need that. One local, file-scoped fix is needed: `StepPortfolio.tsx` calls `URL.createObjectURL`/`revokeObjectURL`, which jsdom doesn't implement — a mock scoped to `StepPortfolio.test.tsx` alone (not the global `jest.setup.ts`, since no other component needs it).

**Tech Stack:** `jest` + `next/jest` (already configured), `@testing-library/react` (already installed), no new dependencies.

## Global Constraints

- **Baseline before this work starts:** `npx tsc --noEmit` in `apps/planner` → **0 errors**. `npm run lint` → **8 problems (7 errors, 1 warning)**, confined to `src/app/offers/[id]/page.tsx`, `src/app/offers/page.tsx`, `src/app/open-requests/[id]/quote/page.tsx`, `src/lib/AuthContext.tsx`, `src/theme/ThemeContext.tsx`. Every task below must keep both counts exactly at this baseline for the files it touches.
- **Never call `render()`/`renderWithI18n` more than once within the same `test()` block using `getByText`/`queryByText`/`getByDisplayValue`-style bound queries.** Confirmed empirically, the hard way, while writing this plan: those queries default to searching `document.body`, not just the container from that specific `render()` call — a second `render()` in the same test leaves the first one's DOM still mounted (no automatic cleanup between calls within one test), so a query meant to target only the second render's output can match stale content from the first, or throw "multiple elements found." Each task below either uses exactly one `render()`/`renderWithI18n()` per test, or (where two states are compared) uses `container`-scoped queries (`container.querySelectorAll(...)`), which are safe because `container` is a specific DOM node reference, not a `document.body` search. Do not "simplify" any test by merging two single-render tests into one multi-render test.
- **`URL.createObjectURL`/`revokeObjectURL` are not implemented by jsdom** (confirmed empirically: `typeof URL.createObjectURL === 'undefined'` by default in this environment) — `StepPortfolio.tsx` calls both whenever `form.portfolioFiles` is non-empty. Only `StepPortfolio.test.tsx` needs a mock for these; do not add them to `jest.setup.ts`.
- **The `StepPortfolio.test.tsx` mock's `createObjectURL` must return a unique value per call, not a fixed string.** Confirmed empirically: `StepPortfolio.tsx` uses the created URL as each preview's React list `key` — a mock returning the same literal string for every file produces a "duplicate key" React warning as soon as a test renders more than one file (the max-photos test renders 8). Use a per-test counter (see Task 11).
- **Do not cast to `any` to assign `URL.createObjectURL`/`revokeObjectURL` in a test.** `any` triggers `@typescript-eslint/no-explicit-any` (confirmed empirically — an earlier draft using `(global as any).URL...` produced 2 new lint errors). Assigning directly (`URL.createObjectURL = jest.fn(...)`) type-checks cleanly against the DOM lib's own `URL` type declarations and produces no lint findings.
- No snapshot tests. No assertions on resolved/computed CSS values — only rendered `className` strings, DOM structure, and behavior.
- No modification of any of the 11 components' source files.
- Every task ends with: the new test file's own suite passing, `npx tsc --noEmit` unchanged from the baseline above, `npm run lint` introducing no new findings on the changed files, and a commit.

---

## Task 1: `Chip.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/Chip.test.tsx`

**Interfaces:**
- Consumes: `Chip` from `./Chip` (already implemented, do not modify). `Star` icon from `phosphor-react` (a real, existing export).

- [ ] **Step 1: Write `Chip.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/Chip.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';
import { Star } from 'phosphor-react';

import { Chip } from './Chip';

describe('Chip', () => {
  test('renders the children text', () => {
    const { getByText } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh')).toBeInTheDocument();
  });

  test('on=true applies the active classes', () => {
    const { getByText } = render(
      <Chip on={true} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh').className).toContain('border-brand bg-purple-50 text-brand');
  });

  test('on=false applies the inactive classes', () => {
    const { getByText } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh').className).toContain('border-border-strong bg-bg-surface text-fg1');
  });

  test('renders the icon only when provided', () => {
    const { container: withIcon } = render(
      <Chip on={false} onClick={() => {}} icon={Star}>
        Riyadh
      </Chip>
    );
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withoutIcon } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(withoutIcon.querySelectorAll('svg')).toHaveLength(0);
  });

  test('onClick fires on click', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Chip on={false} onClick={onClick}>
        Riyadh
      </Chip>
    );
    fireEvent.click(getByText('Riyadh'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Chip.test`
Expected: all 5 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: 0 errors (matches baseline).

Run: `cd apps/planner && npm run lint`
Expected: 8 problems (7 errors, 1 warning), same 5 files as the Global Constraints baseline — nothing new in `Chip.test.tsx`.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/Chip.test.tsx
git commit -m "Add Chip unit tests"
```

---

## Task 2: `Field.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/Field.test.tsx`

**Interfaces:**
- Consumes: `Field` from `./Field` (already implemented, do not modify).

- [ ] **Step 1: Write `Field.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/Field.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Field } from './Field';

describe('Field', () => {
  test('renders label and children', () => {
    const { getByText } = render(
      <Field label="Email">
        <input />
      </Field>
    );
    expect(getByText('Email')).toBeInTheDocument();
  });

  test('renders hint when provided', () => {
    const { getByText } = render(
      <Field label="Email" hint="We'll never share this">
        <input />
      </Field>
    );
    expect(getByText("We'll never share this")).toBeInTheDocument();
  });

  test('omits hint when not provided', () => {
    const { queryByText } = render(
      <Field label="Email">
        <input />
      </Field>
    );
    expect(queryByText("We'll never share this")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false Field.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/Field.test.tsx
git commit -m "Add Field unit tests"
```

---

## Task 3: `TextInput.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/TextInput.test.tsx`

**Interfaces:**
- Consumes: `TextInput` from `./TextInput` (already implemented, do not modify). `Envelope` icon from `phosphor-react`.

- [ ] **Step 1: Write `TextInput.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/TextInput.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';
import { Envelope } from 'phosphor-react';

import { TextInput } from './TextInput';

describe('TextInput', () => {
  test('renders the icon only when provided', () => {
    const { container: withIcon } = render(<TextInput icon={Envelope} />);
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withoutIcon } = render(<TextInput />);
    expect(withoutIcon.querySelectorAll('svg')).toHaveLength(0);
  });

  test('native input attributes pass through', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput value="hello" onChange={onChange} placeholder="Type here" type="email" />
    );
    const input = getByPlaceholderText('Type here') as HTMLInputElement;
    expect(input.value).toBe('hello');
    expect(input.type).toBe('email');

    fireEvent.change(input, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false TextInput.test`
Expected: both tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/TextInput.test.tsx
git commit -m "Add TextInput unit tests"
```

---

## Task 4: `StepHead.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepHead.test.tsx`

**Interfaces:**
- Consumes: `StepHead` from `./StepHead` (already implemented, do not modify).

- [ ] **Step 1: Write `StepHead.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepHead.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { StepHead } from './StepHead';

describe('StepHead', () => {
  test('renders title and subtitle', () => {
    const { getByText } = render(<StepHead title="Create your account" subtitle="Let's get started" />);
    expect(getByText('Create your account')).toBeInTheDocument();
    expect(getByText("Let's get started")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepHead.test`
Expected: the test passes, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepHead.test.tsx
git commit -m "Add StepHead unit tests"
```

---

## Task 5: `BrandRail.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/BrandRail.test.tsx`

**Interfaces:**
- Consumes: `BrandRail` from `./BrandRail` (already implemented, do not modify). `renderWithI18n` from `@/test-utils`.

- [ ] **Step 1: Write `BrandRail.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/BrandRail.test.tsx`:

```tsx
import { renderWithI18n } from '@/test-utils';
import { BrandRail } from './BrandRail';

describe('BrandRail', () => {
  test('renders the real translated step labels', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={0} done={false} />);
    expect(getByText('Account')).toBeInTheDocument();
    expect(getByText('Business')).toBeInTheDocument();
    expect(getByText('Services')).toBeInTheDocument();
    expect(getByText('Portfolio')).toBeInTheDocument();
    expect(getByText('Verification')).toBeInTheDocument();
  });

  test('step=2: earlier steps are done, current step is active, later steps are todo', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={2} done={false} />);
    const account = getByText('Account').className;
    expect(account).not.toContain('font-semibold');
    expect(account).not.toContain('white/60');

    expect(getByText('Services').className).toContain('font-semibold text-white');
    expect(getByText('Portfolio').className).toContain('text-white/60');
  });

  test('done=true: every step renders as done regardless of step', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={0} done={true} />);
    const verification = getByText('Verification').className;
    expect(verification).not.toContain('font-semibold');
    expect(verification).not.toContain('white/60');
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false BrandRail.test`
Expected: all 3 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/BrandRail.test.tsx
git commit -m "Add BrandRail unit tests"
```

---

## Task 6: `StepAccount.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepAccount.test.tsx`

**Interfaces:**
- Consumes: `StepAccount` from `./StepAccount` (already implemented, do not modify). `INITIAL_FORM` from `./types`.

- [ ] **Step 1: Write `StepAccount.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepAccount.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepAccount } from './StepAccount';
import { INITIAL_FORM } from './types';

describe('StepAccount', () => {
  test('renders current form values and fires onChange with the right patch per field', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, businessName: 'Layla Events', fullName: 'Layla', phone: '0500000000', email: 'a@b.com', password: 'secret' };
    const { getByDisplayValue } = await renderWithI18n(<StepAccount form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('Layla Events'), { target: { value: 'New Name' } });
    expect(onChange).toHaveBeenCalledWith({ businessName: 'New Name' });

    fireEvent.change(getByDisplayValue('Layla'), { target: { value: 'Sara' } });
    expect(onChange).toHaveBeenCalledWith({ fullName: 'Sara' });

    fireEvent.change(getByDisplayValue('0500000000'), { target: { value: '0511111111' } });
    expect(onChange).toHaveBeenCalledWith({ phone: '0511111111' });

    fireEvent.change(getByDisplayValue('a@b.com'), { target: { value: 'c@d.com' } });
    expect(onChange).toHaveBeenCalledWith({ email: 'c@d.com' });

    fireEvent.change(getByDisplayValue('secret'), { target: { value: 'newpass' } });
    expect(onChange).toHaveBeenCalledWith({ password: 'newpass' });
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepAccount.test`
Expected: the test passes, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepAccount.test.tsx
git commit -m "Add StepAccount unit tests"
```

---

## Task 7: `StepVerify.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepVerify.test.tsx`

**Interfaces:**
- Consumes: `StepVerify` from `./StepVerify` (already implemented, do not modify). `INITIAL_FORM` from `./types`.

- [ ] **Step 1: Write `StepVerify.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepVerify.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepVerify } from './StepVerify';
import { INITIAL_FORM } from './types';

describe('StepVerify', () => {
  test('crNumber field renders its value and fires onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, crNumber: '1234567890' };
    const { getByDisplayValue } = await renderWithI18n(<StepVerify form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('1234567890'), { target: { value: '0987654321' } });
    expect(onChange).toHaveBeenCalledWith({ crNumber: '0987654321' });
  });

  test('terms checkbox reflects agreedToTerms and toggles it on click', async () => {
    const onChange = jest.fn();
    const { getByText, container: uncheckedContainer } = await renderWithI18n(
      <StepVerify form={{ ...INITIAL_FORM, agreedToTerms: false }} onChange={onChange} />
    );
    expect(uncheckedContainer.querySelectorAll('svg').length).toBe(2); // IdentificationBadge + UploadSimple icons, no check

    fireEvent.click(getByText('I agree to the Partner Terms & Commission Policy.').closest('label')!.querySelector('button')!);
    expect(onChange).toHaveBeenCalledWith({ agreedToTerms: true });

    const { container: checkedContainer } = await renderWithI18n(
      <StepVerify form={{ ...INITIAL_FORM, agreedToTerms: true }} onChange={() => {}} />
    );
    expect(checkedContainer.querySelectorAll('svg').length).toBe(3); // IdentificationBadge + UploadSimple + Check icons
  });
});
```

Note: the second test uses two `renderWithI18n` calls, but only reads `container`-scoped queries (`querySelectorAll` on each render's own `container`) after the first render's `getByText`-based interaction is already done — this is safe per the Global Constraints note, since it never mixes a body-scoped query with a stale earlier render.

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepVerify.test`
Expected: both tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepVerify.test.tsx
git commit -m "Add StepVerify unit tests"
```

---

## Task 8: `StepBusiness.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepBusiness.test.tsx`

**Interfaces:**
- Consumes: `StepBusiness` from `./StepBusiness` (already implemented, do not modify). `INITIAL_FORM` from `./types`.

- [ ] **Step 1: Write `StepBusiness.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepBusiness.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepBusiness } from './StepBusiness';
import { INITIAL_FORM } from './types';

describe('StepBusiness', () => {
  test('renders real translated chip labels for city, team size, and years', async () => {
    const { getByText } = await renderWithI18n(<StepBusiness form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Riyadh')).toBeInTheDocument();
    expect(getByText('Just me')).toBeInTheDocument();
    expect(getByText('<1 yr')).toBeInTheDocument();
  });

  test('the chip matching the current form value renders as active', async () => {
    const form = { ...INITIAL_FORM, city: 'jeddah' as const };
    const { getByText } = await renderWithI18n(<StepBusiness form={form} onChange={() => {}} />);
    expect(getByText('Jeddah').className).toContain('border-brand bg-purple-50 text-brand');
    expect(getByText('Riyadh').className).not.toContain('border-brand bg-purple-50 text-brand');
  });

  test('clicking a city/team-size/years chip fires the right single-value onChange patch', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepBusiness form={INITIAL_FORM} onChange={onChange} />);

    fireEvent.click(getByText('Jeddah'));
    expect(onChange).toHaveBeenCalledWith({ city: 'jeddah' });

    fireEvent.click(getByText('2–5 people'));
    expect(onChange).toHaveBeenCalledWith({ teamSize: '2–5 people' });

    fireEvent.click(getByText('1–3 yrs'));
    expect(onChange).toHaveBeenCalledWith({ yearsInBusiness: '1–3 yrs' });
  });

  test('bio textarea passes through value and onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, bio: 'We plan weddings.' };
    const { getByDisplayValue } = await renderWithI18n(<StepBusiness form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('We plan weddings.'), { target: { value: 'Updated bio' } });
    expect(onChange).toHaveBeenCalledWith({ bio: 'Updated bio' });
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepBusiness.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepBusiness.test.tsx
git commit -m "Add StepBusiness unit tests"
```

---

## Task 9: `StepServices.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepServices.test.tsx`

**Interfaces:**
- Consumes: `StepServices` from `./StepServices` (already implemented, do not modify). `INITIAL_FORM` from `./types`.

- [ ] **Step 1: Write `StepServices.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepServices.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepServices } from './StepServices';
import { INITIAL_FORM } from './types';

describe('StepServices', () => {
  test('renders real translated category and budget-tier chip labels', async () => {
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Wedding')).toBeInTheDocument();
    expect(getByText('Value')).toBeInTheDocument();
  });

  test('clicking an unselected category chip adds it to form.categories', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={onChange} />);
    fireEvent.click(getByText('Wedding'));
    expect(onChange).toHaveBeenCalledWith({ categories: ['weddings'] });
  });

  test('clicking a selected category chip removes it from form.categories', async () => {
    const onChange = jest.fn();
    const formWithWedding = { ...INITIAL_FORM, categories: ['weddings' as const] };
    const { getByText } = await renderWithI18n(<StepServices form={formWithWedding} onChange={onChange} />);
    fireEvent.click(getByText('Wedding'));
    expect(onChange).toHaveBeenCalledWith({ categories: [] });
  });

  test('the selected category chip renders as active', async () => {
    const form = { ...INITIAL_FORM, categories: ['weddings' as const] };
    const { getByText } = await renderWithI18n(<StepServices form={form} onChange={() => {}} />);
    expect(getByText('Wedding').className).toContain('border-brand bg-purple-50 text-brand');
  });

  test('budget-tier chip single-selects like StepBusiness', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={onChange} />);
    fireEvent.click(getByText('Premium'));
    expect(onChange).toHaveBeenCalledWith({ budgetTier: 'Premium' });
  });

  test('startingPrice input passes through value and onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, startingPrice: '5000' };
    const { getByDisplayValue } = await renderWithI18n(<StepServices form={form} onChange={onChange} />);
    fireEvent.change(getByDisplayValue('5000'), { target: { value: '6000' } });
    expect(onChange).toHaveBeenCalledWith({ startingPrice: '6000' });
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepServices.test`
Expected: all 6 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepServices.test.tsx
git commit -m "Add StepServices unit tests"
```

---

## Task 10: `PendingState.test.tsx`

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/PendingState.test.tsx`

**Interfaces:**
- Consumes: `PendingState` from `./PendingState` (already implemented, do not modify).

- [ ] **Step 1: Write `PendingState.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/PendingState.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { PendingState } from './PendingState';

describe('PendingState', () => {
  test('renders businessName interpolated into the real translated subtitle', async () => {
    const { container } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={() => {}} />);
    expect(container.textContent).toContain('Layla Events');
    expect(container.textContent).toContain('Our team reviews most applications within');
  });

  test('renders the checklist with the right item states', async () => {
    const { getByText } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={() => {}} />);
    expect(getByText('Account created')).toBeInTheDocument();
    expect(getByText('Business details')).toBeInTheDocument();
    expect(getByText('Documents under review')).toBeInTheDocument();
    expect(getByText('Go live on Ratibha')).toBeInTheDocument();
  });

  test('the "in review" badge renders only on the active checklist item', async () => {
    const { getByText, queryAllByText } = await renderWithI18n(
      <PendingState businessName="Layla Events" onGoLive={() => {}} />
    );
    expect(getByText('In review')).toBeInTheDocument();
    expect(queryAllByText('In review')).toHaveLength(1);
  });

  test('the primary button fires onGoLive on click', async () => {
    const onGoLive = jest.fn();
    const { getByText } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={onGoLive} />);
    fireEvent.click(getByText('Preview my dashboard'));
    expect(onGoLive).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false PendingState.test`
Expected: all 4 tests pass, 0 failures.

- [ ] **Step 3: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit` — expect unchanged, 0 errors.
Run: `cd apps/planner && npm run lint` — expect unchanged, 8 problems in the same 5 baseline files.

- [ ] **Step 4: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/PendingState.test.tsx
git commit -m "Add PendingState unit tests"
```

---

## Task 11: `StepPortfolio.test.tsx` + final full-suite check

**Files:**
- Create: `apps/planner/src/app/onboarding/_components/StepPortfolio.test.tsx`

**Interfaces:**
- Consumes: `StepPortfolio` from `./StepPortfolio` (already implemented, do not modify). `INITIAL_FORM`, `MAX_PORTFOLIO_PHOTOS` from `./types`.

- [ ] **Step 1: Write `StepPortfolio.test.tsx`**

Create `apps/planner/src/app/onboarding/_components/StepPortfolio.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepPortfolio } from './StepPortfolio';
import { INITIAL_FORM, MAX_PORTFOLIO_PHOTOS } from './types';

// jsdom does not implement URL.createObjectURL/revokeObjectURL — StepPortfolio
// calls both whenever form.portfolioFiles is non-empty. Only this one
// component needs this, so the mock is scoped to this file rather than
// added to the global jest.setup.ts.
// StepPortfolio.tsx uses the created URL as each preview's React list key —
// a mock that always returns the same string produces a duplicate-key
// warning as soon as a test renders more than one file, so this generates
// a unique value per call.
let objectUrlCounter = 0;
beforeEach(() => {
  objectUrlCounter = 0;
  URL.createObjectURL = jest.fn(() => `blob:mock-url-${objectUrlCounter++}`);
  URL.revokeObjectURL = jest.fn();
});

describe('StepPortfolio', () => {
  test('empty state: renders the add-photo tile, no previews', async () => {
    const { container, getByText } = await renderWithI18n(<StepPortfolio form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Add photo')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(getByText('0/8 photos')).toBeInTheDocument();
  });

  test('selecting a file via the hidden input calls onChange with the file appended', async () => {
    const onChange = jest.fn();
    const { container } = await renderWithI18n(<StepPortfolio form={INITIAL_FORM} onChange={onChange} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith({ portfolioFiles: [file] });
  });

  test('non-empty portfolioFiles: renders a preview per file and the correct count', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const form = { ...INITIAL_FORM, portfolioFiles: [file] };
    const { container, getByText } = await renderWithI18n(<StepPortfolio form={form} onChange={() => {}} />);

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(getByText('1/8 photos')).toBeInTheDocument();
  });

  test('removing a photo calls onChange with that file filtered out', async () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, portfolioFiles: [fileA, fileB] };
    const { getAllByLabelText } = await renderWithI18n(<StepPortfolio form={form} onChange={onChange} />);

    fireEvent.click(getAllByLabelText('Remove photo')[0]);
    expect(onChange).toHaveBeenCalledWith({ portfolioFiles: [fileB] });
  });

  test('the add-more tile disappears once portfolioFiles reaches the max', async () => {
    const files = Array.from({ length: MAX_PORTFOLIO_PHOTOS }, (_, i) => new File(['x'], `${i}.png`, { type: 'image/png' }));
    const form = { ...INITIAL_FORM, portfolioFiles: files };
    const { queryByText } = await renderWithI18n(<StepPortfolio form={form} onChange={() => {}} />);
    expect(queryByText('Add photo')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it passes**

Run: `cd apps/planner && npm test -- --watchAll=false StepPortfolio.test`
Expected: all 5 tests pass, 0 failures, no "duplicate key" React warning in the output. If a duplicate-key warning appears, the `createObjectURL` mock is returning the same string for every call — re-check it uses the `objectUrlCounter` exactly as shown above.

- [ ] **Step 3: Run the full suite together**

Run: `cd apps/planner && npm test -- --watchAll=false`
Expected: all 28 test files pass (17 existing + 11 from this plan), every test green, 0 failures.

- [ ] **Step 4: Re-check the tsc and lint baseline**

Run: `cd apps/planner && npx tsc --noEmit`
Expected: unchanged, 0 errors.

Run: `cd apps/planner && npm run lint`
Expected: unchanged, 8 problems in the same 5 baseline files — nothing new anywhere in this plan's 11 new test files. If you see 2 `@typescript-eslint/no-explicit-any` findings in `StepPortfolio.test.tsx`, you cast to `any` instead of assigning `URL.createObjectURL`/`revokeObjectURL` directly — see the Global Constraints note.

- [ ] **Step 5: Commit**

```bash
cd apps/planner
git add src/app/onboarding/_components/StepPortfolio.test.tsx
git commit -m "Add StepPortfolio unit tests"
```
