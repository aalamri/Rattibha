'use client';

import { WhatsappLogo } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { getWhatsAppHref } from '@/lib/whatsapp';

/** Inline "still have questions?" prompt closing the homepage funnel, right
 * after the FAQ — the floating WhatsAppButton (task #23) is always
 * available site-wide, but the funnel sequence from the technical
 * recommendations explicitly ends in "FAQ → WhatsApp help" as its own step,
 * not just an ambient bubble. Renders nothing if WhatsApp isn't configured,
 * same as the floating button. */
export function WhatsAppHelp() {
  const { t } = useTranslation();
  const href = getWhatsAppHref(t('whatsapp.prefillMessage'));
  if (!href) return null;

  return (
    <div className="border-y border-border bg-[#F5F0FA]">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-10 py-14 text-center">
        <h2 className="font-display text-[24px] font-semibold text-fg1">{t('whatsapp.helpTitle')}</h2>
        <p className="max-w-[480px] text-[15px] leading-[1.6] text-fg2">{t('whatsapp.helpSubtitle')}</p>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button variant="whatsapp" size="lg" icon={WhatsappLogo}>
            {t('whatsapp.helpCta')}
          </Button>
        </a>
      </div>
    </div>
  );
}
