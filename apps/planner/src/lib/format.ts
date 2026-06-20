/** Number formatting that respects Arabic-Indic numerals in RTL — `toLocaleString()` without
 * an explicit locale always renders Western digits, regardless of the active app language. */
export function formatNumber(value: number, lang: string) {
  return value.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');
}
