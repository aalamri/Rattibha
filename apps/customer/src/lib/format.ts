/** Number formatting that respects Arabic-Indic numerals in RTL — `toLocaleString()` without
 * an explicit locale always renders Western digits, regardless of the active app language. */
export function formatNumber(value: number, isRTL: boolean) {
  return value.toLocaleString(isRTL ? 'ar-SA' : 'en-US');
}
