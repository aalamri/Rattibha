'use client';

import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/ui/Logo';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';

const PLANNER_APP_URL = process.env.NEXT_PUBLIC_PLANNER_APP_URL ?? '#';
const SUPPORT_EMAIL = 'support@ratibha.com';

// Every link below has a genuine destination — no decorative-only labels.
// "Pricing"/"Success stories"/"Resources"/"Careers"/"Press" and the social
// icon row were removed rather than left as fake affordances, since none of
// those had a real page or account to point to (see the end-to-end audit
// that found these). Re-add once real destinations exist.
const CUSTOMER_LINKS = [
  { key: 'nav.browsePlanners', getHref: (lang: AppLanguage) => `${localeHref(lang, '/')}#planners` },
  { key: 'nav.howItWorks', getHref: (lang: AppLanguage) => `${localeHref(lang, '/')}#how-it-works` },
  { key: 'footer.reviews', getHref: (lang: AppLanguage) => `${localeHref(lang, '/')}#testimonials` },
] as const;

const PLANNER_LINKS = [
  { key: 'footer.joinRatibha', getHref: (lang: AppLanguage) => localeHref(lang, '/for-planners') },
  { key: 'footer.plannerDashboard', getHref: () => PLANNER_APP_URL },
] as const;

const COMPANY_LINKS = [
  { key: 'nav.about', getHref: (lang: AppLanguage) => `${localeHref(lang, '/')}#about` },
  { key: 'footer.contact', getHref: () => `mailto:${SUPPORT_EMAIL}` },
] as const;

const LEGAL_LINKS = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'refundPolicy', href: '/refund-policy' },
  { key: 'cancellationPolicy', href: '/cancellation-policy' },
  { key: 'disputeResolution', href: '/dispute-resolution' },
  { key: 'plannerVerification', href: '/planner-verification' },
] as const;

/** Link columns + legal row — matches `Footer` in sections.jsx. */
export function Footer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;

  const columns = [
    { heading: t('footer.customers'), links: CUSTOMER_LINKS },
    { heading: t('footer.planners'), links: PLANNER_LINKS },
    { heading: t('footer.company'), links: COMPANY_LINKS },
  ];

  return (
    <div className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr_0.85fr]">
        <div>
          <Logo size={40} />
          <p className="my-4 max-w-[280px] text-[13.5px] leading-[1.55] text-fg2">{t('footer.tagline')}</p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="mb-3.5 text-[13px] font-extrabold text-fg1">{col.heading}</div>
            <div className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <a key={link.key} href={link.getHref(lang)} className="text-[13.5px] text-fg2 hover:text-fg1">
                  {t(link.key)}
                </a>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-3.5 text-[13px] font-extrabold text-fg1">{t('footer.legalHeading')}</div>
          <div className="flex flex-col gap-2.5">
            {LEGAL_LINKS.map(({ key, href }) => (
              <a key={key} href={localeHref(lang, href)} className="text-[13.5px] text-fg2 hover:text-fg1">
                {t(`footer.legalLinks.${key}`)}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 border-t border-border px-10 py-4.5 sm:flex-row">
        <span className="text-[12.5px] text-fg3">{t('footer.copyright')}</span>
        <span className="text-[12px] text-fg3">{t('footer.crNotice')}</span>
        <span className="text-[12.5px] text-fg3">{t('footer.legal')}</span>
      </div>
    </div>
  );
}
