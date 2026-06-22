'use client';

import { InstagramLogo, SnapchatLogo, TiktokLogo, TwitterLogo } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/ui/Logo';

const SOCIAL_ICONS = [InstagramLogo, TwitterLogo, TiktokLogo, SnapchatLogo];

/** Link columns + social + legal row — matches `Footer` in sections.jsx. */
export function Footer() {
  const { t } = useTranslation();

  const columns = [
    { heading: t('footer.customers'), links: t('footer.customersLinks', { returnObjects: true }) as string[] },
    { heading: t('footer.planners'), links: t('footer.plannersLinks', { returnObjects: true }) as string[] },
    { heading: t('footer.company'), links: t('footer.companyLinks', { returnObjects: true }) as string[] },
  ];

  return (
    <div className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo size={40} />
          <p className="my-4 max-w-[280px] text-[13.5px] leading-[1.55] text-fg2">{t('footer.tagline')}</p>
          <div className="flex gap-2.5">
            {SOCIAL_ICONS.map((IconComp, i) => (
              <div key={i} className="grid h-9.5 w-9.5 cursor-pointer place-items-center rounded-full border-[1.5px] border-border-strong">
                <IconComp size={18} className="text-fg1" />
              </div>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="mb-3.5 text-[13px] font-extrabold text-fg1">{col.heading}</div>
            <div className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <span key={link} className="cursor-pointer text-[13.5px] text-fg2">
                  {link}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 border-t border-border px-10 py-4.5 sm:flex-row">
        <span className="text-[12.5px] text-fg3">{t('footer.copyright')}</span>
        <span className="text-[12.5px] text-fg3">{t('footer.legal')}</span>
      </div>
    </div>
  );
}
