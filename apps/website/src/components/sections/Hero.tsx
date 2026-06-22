'use client';

import Image from 'next/image';
import { CalendarBlank, Confetti, MagnifyingGlass, MapPin, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';

function SearchSeg({ icon: IconComp, label, value }: { icon: typeof CalendarBlank; label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2.5 px-4 py-3.5">
      <IconComp size={19} className="text-brand" />
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-fg3">{label}</div>
        <div className="text-sm font-semibold text-fg1">{value}</div>
      </div>
    </div>
  );
}

/** Display headline + search bar + photo collage — matches `Hero` in sections.jsx. */
export function Hero() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{ backgroundImage: 'url(/pattern.svg)', backgroundSize: '64px' }}
      />
      <Image
        src="/glyph-ra.png"
        alt=""
        aria-hidden
        width={360}
        height={431}
        className="pointer-events-none absolute -top-14 end-0 -me-10 rotate-[-8deg] opacity-[0.16]"
      />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-10 py-16 pb-[72px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge bg="#F2E2A6" fg="#7a5a14" icon={Star}>
            {t('hero.trustBadge')}
          </Badge>
          <h1 className="mt-4.5 font-display text-[66px] font-semibold leading-[1.02] tracking-[-0.02em] text-fg1">
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleWorth')} <span className="italic text-brand">{t('hero.titleRemembering')}</span>
          </h1>
          <p className="mt-5 max-w-[460px] text-lg leading-[1.55] text-fg2">{t('hero.subtitle')}</p>

          <div className="mt-7.5 flex max-w-[560px] items-stretch overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_44px_-22px_rgba(43,34,51,0.3)]">
            <SearchSeg icon={Confetti} label={t('hero.searchEvent')} value={t('hero.eventValue')} />
            <div className="my-3 w-px bg-border" />
            <SearchSeg icon={MapPin} label={t('hero.searchCity')} value={t('hero.cityValue')} />
            <div className="my-3 w-px bg-border" />
            <SearchSeg icon={CalendarBlank} label={t('hero.searchDate')} value={t('hero.dateValue')} />
            <button
              type="button"
              className="m-1.5 grid place-items-center rounded-xl bg-brand px-5 text-white"
              aria-label={t('hero.searchEvent')}
            >
              <MagnifyingGlass size={21} weight="bold" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4.5">
            <div className="flex">
              {[1, 2, 4, 3].map((s, i) => (
                <div key={i} className={i ? '-ms-3' : ''}>
                  <Avatar seed={s} size={38} />
                </div>
              ))}
            </div>
            <span className="text-[13.5px] text-fg2">
              <b className="text-fg1">4.9/5</b> {t('hero.reviewsCount')}
            </span>
          </div>
        </div>

        <div className="relative h-[460px]">
          <Photo seed={0} label={t('hero.collageWeddings')} className="absolute top-0 start-6 h-[320px] w-[250px] rounded-[22px] shadow-[0_30px_60px_-28px_rgba(43,34,51,0.45)]" />
          <Photo seed={4} label={t('hero.collageGalas')} className="absolute top-[150px] end-0 h-[250px] w-[210px] rounded-[22px] shadow-[0_30px_60px_-28px_rgba(43,34,51,0.45)]" />
          <div className="absolute bottom-1.5 start-0 flex w-[250px] items-center gap-2.5 rounded-2xl border border-border bg-white p-3 shadow-[0_20px_44px_-18px_rgba(43,34,51,0.4)]">
            <Photo seed={2} className="h-[52px] w-[52px] flex-shrink-0 rounded-xl" />
            <div className="flex-1">
              <div className="font-display text-[17px] font-semibold text-fg1">Lumière Events</div>
              <div className="text-[11.5px] text-fg3">
                {t('hero.floatingPlannerCity')} · {t('hero.floatingPlannerType')}
              </div>
            </div>
            <Badge bg="#F2E2A6" fg="#7a5a14" icon={Star}>
              4.9
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
