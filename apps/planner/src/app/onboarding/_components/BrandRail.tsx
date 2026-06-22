import {
  Check,
  Confetti,
  IdentificationCard,
  Image as ImageIcon,
  ShieldCheck,
  Storefront,
  UserCircle,
  type Icon,
} from 'phosphor-react';
import { useTranslation } from 'react-i18next';

const STEP_ICONS: Icon[] = [UserCircle, Storefront, Confetti, ImageIcon, IdentificationCard];
const STEP_KEYS = ['account', 'business', 'services', 'portfolio', 'verify'] as const;

export function BrandRail({ step, done }: { step: number; done: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="relative hidden w-[300px] flex-shrink-0 flex-col overflow-hidden bg-[linear-gradient(160deg,#5B2C83,#2B1440)] px-7 py-9 lg:flex">
      <div className="relative flex flex-1 flex-col">
        <span className="font-display text-xl font-semibold text-white">{t('common.appName')}</span>
        <div className="mt-9">
          <div className="font-display text-[26px] font-semibold leading-tight text-white">{t('onboarding.rail.title')}</div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">{t('onboarding.rail.subtitle')}</p>
        </div>

        <div className="mt-9 flex flex-col gap-1">
          {STEP_KEYS.map((key, i) => {
            const StepIcon = STEP_ICONS[i];
            const state = done || i < step ? 'done' : i === step ? 'active' : 'todo';
            return (
              <div key={key} className="flex items-center gap-3 py-2">
                <div
                  className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${
                    state === 'active' ? 'bg-white' : state === 'done' ? 'bg-gold-500' : 'border-[1.5px] border-white/25'
                  }`}
                >
                  {state === 'done' ? (
                    <Check size={15} weight="bold" className="text-[#3A1B52]" />
                  ) : (
                    <StepIcon size={16} weight={state === 'active' ? 'fill' : 'regular'} className={state === 'active' ? 'text-brand' : 'text-white/70'} />
                  )}
                </div>
                <span className={`text-sm ${state === 'active' ? 'font-semibold text-white' : state === 'todo' ? 'text-white/60' : 'text-white'}`}>
                  {t(`onboarding.steps.${key}`)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-9 text-[12.5px] text-white/70">
          <ShieldCheck size={17} weight="fill" className="text-gold-500" />
          {t('onboarding.rail.secure')}
        </div>
      </div>
    </div>
  );
}
