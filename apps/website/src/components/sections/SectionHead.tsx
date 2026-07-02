'use client';

import { useIsRTL } from '@/i18n/useIsRTL';

interface SectionHeadProps {
  over: string;
  title: string;
  sub?: string;
  action?: string;
  actionHref?: string;
  center?: boolean;
}

/** Overline + display title + optional subtitle/action — matches `SectionHead` in sections.jsx. */
export function SectionHead({ over, title, sub, action, actionHref, center }: SectionHeadProps) {
  const isRTL = useIsRTL();
  // Arabic is a cursive, joined script — letter-spacing breaks the visual
  // connections between joined letterforms, and Latin display type's tight
  // leading clips Arabic ascenders/diacritics, so both are relaxed for RTL.
  const overEl = (
    <div className={`text-[12.5px] font-extrabold uppercase text-gold-500 ${isRTL ? '' : 'tracking-[0.14em]'}`}>{over}</div>
  );
  const titleEl = (
    <h2
      className={`mt-2.5 font-display text-[42px] font-semibold text-fg1 ${isRTL ? 'leading-[1.25]' : 'leading-[1.08] tracking-[-0.01em]'}`}
    >
      {title}
    </h2>
  );
  const subEl = sub && <p className="mt-3 text-base leading-[1.5] text-fg2">{sub}</p>;

  if (center) {
    return (
      <div className="mx-auto max-w-[640px] text-center">
        {overEl}
        {titleEl}
        {subEl}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        {overEl}
        {titleEl}
        {subEl}
      </div>
      {action && actionHref && (
        <a href={actionHref} className="whitespace-nowrap text-[14.5px] font-bold text-brand">
          {action} {isRTL ? '←' : '→'}
        </a>
      )}
      {action && !actionHref && (
        <span className="whitespace-nowrap text-[14.5px] font-bold text-brand">
          {action} {isRTL ? '←' : '→'}
        </span>
      )}
    </div>
  );
}
