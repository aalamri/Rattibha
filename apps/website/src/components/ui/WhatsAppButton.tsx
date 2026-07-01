'use client';

import { WhatsappLogo } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

// Digits only, country code included, no "+"/spaces/dashes (e.g. 9665XXXXXXXX)
// — the format wa.me requires. Sanitized defensively in case it's set with
// formatting. Set in .env.local / the deployment's env config; never
// hardcoded here.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '');

/**
 * Floating, site-wide WhatsApp lead-capture button — Saudi users often
 * prefer direct messaging over web forms (see task #23). Renders nothing
 * if NEXT_PUBLIC_WHATSAPP_NUMBER isn't configured, rather than linking to
 * a dead placeholder number — same principle as the omitted social links
 * in [locale]/layout.tsx's JSON-LD.
 */
export function WhatsAppButton() {
  const { t } = useTranslation();
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('whatsapp.prefillMessage'))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.ariaLabel')}
      className="fixed bottom-6 end-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform hover:scale-105"
    >
      <WhatsappLogo size={30} weight="fill" />
    </a>
  );
}
