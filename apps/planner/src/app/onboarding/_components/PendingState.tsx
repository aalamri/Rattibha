import { ArrowRight, Check, Clock, PaperPlaneTilt } from 'phosphor-react';
import { Trans, useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const CHECKLIST = [
  { key: 'account', state: 'done' as const },
  { key: 'business', state: 'done' as const },
  { key: 'review', state: 'active' as const },
  { key: 'live', state: 'todo' as const },
];

export function PendingState({ businessName, onGoLive }: { businessName: string; onGoLive: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
      <div className="relative mb-5.5 grid h-24 w-24 place-items-center rounded-3xl bg-purple-50">
        <PaperPlaneTilt size={46} weight="fill" className="text-brand" />
        <div className="absolute -bottom-1 end-[-4px] grid h-9 w-9 place-items-center rounded-full border-[3px] border-bg-surface bg-gold-500">
          <Clock size={18} weight="fill" className="text-fg1" />
        </div>
      </div>

      <h2 className="font-display text-[30px] font-bold leading-tight text-fg1">{t('onboarding.pending.title')}</h2>
      <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-relaxed text-fg2">
        <Trans i18nKey="onboarding.pending.subtitle" values={{ businessName }} components={{ bold: <b className="text-fg1" /> }} />
      </p>

      <div className="mt-6 flex w-full max-w-[440px] flex-col gap-2.5 rounded-md border border-border bg-bg-surface p-4.5 text-start">
        {CHECKLIST.map(({ key, state }) => (
          <div key={key} className="flex items-center gap-2.5">
            <div
              className={`grid h-[26px] w-[26px] flex-shrink-0 place-items-center rounded-full ${
                state === 'done' ? 'bg-emerald-500' : state === 'active' ? 'bg-gold-200' : 'border-[1.5px] border-border-strong'
              }`}
            >
              {state === 'done' && <Check size={14} weight="bold" className="text-white" />}
              {state === 'active' && <Clock size={14} weight="fill" className="text-gold-600" />}
            </div>
            <span className={`flex-1 text-sm ${state === 'active' ? 'font-semibold text-fg1' : state === 'todo' ? 'text-fg3' : 'text-fg1'}`}>
              {t(`onboarding.pending.checklist.${key}`)}
            </span>
            {state === 'active' && <Badge tone="amber">{t('onboarding.pending.inReview')}</Badge>}
          </div>
        ))}
      </div>

      <Button size="lg" iconRight={ArrowRight} onClick={onGoLive} className="mt-6 w-full max-w-[440px] justify-center">
        {t('onboarding.pending.previewDashboard')}
      </Button>
      <p className="mt-3 text-[12.5px] text-fg3">{t('onboarding.pending.questions')}</p>
    </div>
  );
}
