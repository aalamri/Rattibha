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
  // formatDate passes to Date.prototype.toLocaleDateString, rather than
  // relying on formatted output that happens to be identical for 'ar-SA'
  // and 'ar-SA-u-ca-gregory' under this environment's ICU. Spying on
  // Date.prototype.toLocaleDateString (rather than globalThis.Intl.DateTimeFormat)
  // is necessary because toLocaleDateString does not route through
  // globalThis.Intl.DateTimeFormat in this Jest/Node environment in an observable way.
  test('ar calls Date.prototype.toLocaleDateString with the exact ar-SA-u-ca-gregory locale tag', () => {
    const spy = jest.spyOn(Date.prototype, 'toLocaleDateString');
    try {
      formatDate(date, 'ar', options);
      expect(spy).toHaveBeenCalledWith('ar-SA-u-ca-gregory', options);
    } finally {
      spy.mockRestore();
    }
  });
});
