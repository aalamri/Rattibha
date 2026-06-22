'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { SectionHead } from './SectionHead';

interface Quote {
  who: string;
  role: string;
  text: string;
}

const SEEDS = [1, 2, 4];

/** Three testimonial cards — matches `Testimonials` in sections.jsx. */
export function Testimonials() {
  const { t } = useTranslation();
  const quotes = t('testimonials.quotes', { returnObjects: true }) as Quote[];

  return (
    <div className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1180px] px-10 py-16">
        <SectionHead center over={t('testimonials.overline')} title={t('testimonials.title')} />
        <div className="mt-10 grid grid-cols-1 gap-5.5 sm:grid-cols-3">
          {quotes.map((q, i) => (
            <div key={i} className="rounded-[20px] border border-border bg-cream p-6.5 shadow-[0_12px_30px_-20px_rgba(43,34,51,0.25)]">
              <div className="text-[17px] tracking-[2px] text-gold-500">★★★★★</div>
              <p className="my-3.5 font-display text-[21px] font-medium leading-[1.4] text-fg1">&quot;{q.text}&quot;</p>
              <div className="flex items-center gap-3">
                <Avatar seed={SEEDS[i % SEEDS.length]} size={44} initials={q.who.charAt(0)} />
                <div>
                  <div className="text-[14.5px] font-bold text-fg1">{q.who}</div>
                  <div className="text-[12.5px] text-fg3">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
