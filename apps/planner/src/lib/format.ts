/** Number formatting that respects Arabic-Indic numerals in RTL — `toLocaleString()` without
 * an explicit locale always renders Western digits, regardless of the active app language. */
export function formatNumber(value: number, lang: string) {
  return value.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');
}

/** Date formatting locale — `ar-SA` defaults to the Hijri calendar in browser ICU, but this app
 * (per CLAUDE.md, Saudi market) always shows Gregorian dates regardless of language, just with
 * Arabic month names/numerals in RTL. The `-u-ca-gregory` extension forces that explicitly. */
export function formatDate(date: Date, lang: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', options).format(date);
}
