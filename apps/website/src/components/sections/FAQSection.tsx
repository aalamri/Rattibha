'use client';

import { useTranslation } from 'react-i18next';

import { SectionHead } from './SectionHead';

interface FAQItem {
  q: string;
  a: string;
}

/** Homepage FAQ, addressing final-objection questions before the planner
 * CTA/footer. Uses semantic <details>/<summary> — collapsed answers are
 * still present in the server-rendered HTML (not JS-revealed), matching
 * the FAQPage JSON-LD emitted alongside it in [locale]/page.tsx. */
export function FAQSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as FAQItem[];

  return (
    <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-10">
      <SectionHead center over={t('faq.overline')} title={t('faq.title')} />
      <div className="mt-9 flex flex-col gap-3">
        {items.map((item, i) => (
          <details key={i} className="group rounded-2xl border border-border bg-white p-5 open:shadow-card">
            <summary className="cursor-pointer text-[15.5px] font-semibold text-fg1 marker:content-none">{item.q}</summary>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-fg2">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
