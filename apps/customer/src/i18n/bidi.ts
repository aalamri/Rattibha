/**
 * Wraps a segment in Unicode directional isolates (FSI…PDI) so it keeps its own
 * internal ordering when embedded inside an RTL paragraph that mixes Arabic text
 * with Arabic-Indic dates, Latin-digit counts, or en-dash ranges (e.g. "city · date · budget").
 * No-op when `isRTL` is false.
 */
export function bidiIsolate(value: string | number, isRTL: boolean): string {
  return isRTL ? `⁦${value}⁩` : String(value);
}
