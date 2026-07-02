// Digits only, country code included, no "+"/spaces/dashes (e.g. 9665XXXXXXXX)
// — the format wa.me requires. Sanitized defensively in case it's set with
// formatting. Set in .env.local / the deployment's env config; never
// hardcoded here.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '');

/** Builds a wa.me chat link with a pre-filled message, or returns null if
 * NEXT_PUBLIC_WHATSAPP_NUMBER isn't configured — callers should render
 * nothing in that case rather than linking to a dead placeholder number
 * (see task #23). Shared by the floating WhatsAppButton and the homepage's
 * inline "still have questions?" prompt (task #27) so both stay in sync. */
export function getWhatsAppHref(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
