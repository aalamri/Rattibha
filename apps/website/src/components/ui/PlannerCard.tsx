'use client';

import { MapPin, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { formatLocaleNumber } from '@/i18n';
import { Badge } from './Badge';
import { Button } from './Button';
import { Photo } from './Photo';

export interface PlannerCardProps {
  name: string;
  city: string;
  type: string;
  rating: number;
  from: number;
  seed: number;
  premium: boolean;
  href: string;
}

/** Planner summary card used in FeaturedGrid and the public city/category
 * listing pages — extracted from FeaturedGrid so all three surfaces share
 * one implementation instead of drifting apart. */
export function PlannerCard({ name, city, type, rating, from, seed, premium, href }: PlannerCardProps) {
  const { t, i18n } = useTranslation();
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-card">
      <Photo seed={seed} label={premium ? t('featured.premium') : undefined} className="h-[168px]" />
      <div className="p-4.5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 font-display text-[19px] font-semibold leading-tight text-fg1">{name}</span>
          <Badge bg="#F2E2A6" fg="#7a5a14" icon={Star}>
            {formatLocaleNumber(rating, i18n.language, { minimumFractionDigits: 1 })}
          </Badge>
        </div>
        <div className="mt-2 inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
          {type}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-fg3">
          <MapPin size={14} />
          {city}
        </div>
        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-[11.5px] text-fg3">
            {t('featured.from')} {formatLocaleNumber(from, i18n.language)} SAR
          </span>
          <a href={href}>
            <Button size="sm">{t('featured.viewProfile')}</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
