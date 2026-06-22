'use client';

import { MapPin, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { PLANNER_STATS } from '@/data/planners';
import { SectionHead } from './SectionHead';

interface PlannerCardProps {
  name: string;
  city: string;
  type: string;
  rating: number;
  from: number;
  seed: number;
  premium: boolean;
}

function PlannerCard({ name, city, type, rating, from, seed, premium }: PlannerCardProps) {
  const { t, i18n } = useTranslation();
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-card">
      <Photo seed={seed} label={premium ? t('featured.premium') : undefined} className="h-[168px]" />
      <div className="p-4.5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 font-display text-[19px] font-semibold leading-tight text-fg1">{name}</span>
          <Badge bg="#F2E2A6" fg="#7a5a14" icon={Star}>
            {rating}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-fg2">
          <MapPin size={15} />
          {city} · {type}
        </div>
        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-[12.5px] text-fg3">
            {t('featured.from')} <b className="text-[15px] text-fg1">SAR {from.toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</b>
          </span>
          <Button size="sm">{t('featured.viewProfile')}</Button>
        </div>
      </div>
    </div>
  );
}

/** Four-column planner grid — matches `FeaturedGrid` in sections.jsx. */
export function FeaturedGrid() {
  const { t } = useTranslation();
  const planners = t('planners', { returnObjects: true }) as { name: string; city: string; type: string }[];

  return (
    <div className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1180px] px-10 py-16">
        <SectionHead over={t('featured.overline')} title={t('featured.title')} sub={t('featured.subtitle')} action={t('featured.browseAll')} />
        <div className="mt-8 grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-4">
          {planners.map((p, i) => (
            <PlannerCard key={i} name={p.name} city={p.city} type={p.type} {...PLANNER_STATS[i]} />
          ))}
        </div>
      </div>
    </div>
  );
}
