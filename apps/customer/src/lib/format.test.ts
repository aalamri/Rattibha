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

  // This only verifies formatDate builds its Intl.DateTimeFormat call with the
  // exact locale tag 'ar-SA-u-ca-gregory' (catching e.g. a typo or a revert to
  // plain 'ar-SA'). It intentionally does NOT assert that the '-u-ca-gregory'
  // suffix changes the output relative to plain 'ar-SA', because that isn't
  // testable in this environment: the format.ts comment about 'ar-SA'
  // defaulting to Hijri is specifically about iOS's ICU. Node's bundled ICU
  // already defaults 'ar-SA' to the Gregorian calendar, so
  // new Intl.DateTimeFormat('ar-SA', options).format(date) and
  // new Intl.DateTimeFormat('ar-SA-u-ca-gregory', options).format(date)
  // produce identical output here (both "١٣ يوليو ٢٠٢٦" for the test date) -
  // there is no assertion in Jest/Node that would catch the '-u-ca-gregory'
  // suffix being dropped. Covering that regression specifically would require
  // running under iOS's ICU (a real device or simulator test), which is out
  // of scope here.
  test('RTL forces the Gregorian calendar rather than defaulting to Hijri', () => {
    const result = formatDate(date, true, options);
    expect(result).toBe(new Intl.DateTimeFormat('ar-SA-u-ca-gregory', options).format(date));

    // Prove the RTL branch is genuinely exercised and distinct from the LTR
    // output: it must use Arabic-Indic digits, not Western digits (mirrors
    // the formatNumber RTL assertion above).
    expect(result).toMatch(/[٠-٩]/);
    expect(result).not.toMatch(/[0-9]/);
  });
});
