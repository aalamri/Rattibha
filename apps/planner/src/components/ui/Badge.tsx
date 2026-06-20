import type { Icon } from 'phosphor-react';
import type { ReactNode } from 'react';

export type BadgeTone = 'purple' | 'gold' | 'green' | 'amber' | 'red' | 'gray' | 'lav';

const TONE_CLASSES: Record<BadgeTone, string> = {
  purple: 'bg-purple-50 text-brand',
  gold: 'bg-gold-200 text-gold-600',
  green: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-warning-bg text-warning',
  red: 'bg-danger-bg text-danger',
  gray: 'bg-purple-50/60 text-fg2',
  lav: 'bg-lavender-100 text-[#6F539C]',
};

const SOLID_TONE_CLASSES: Record<BadgeTone, string> = {
  purple: 'bg-brand text-white',
  gold: 'bg-gold-500 text-fg1',
  green: 'bg-emerald-500 text-white',
  amber: 'bg-warning text-white',
  red: 'bg-danger text-white',
  gray: 'bg-fg2 text-white',
  lav: 'bg-[#6F539C] text-white',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: Icon;
  solid?: boolean;
  className?: string;
}

export function Badge({ children, tone = 'purple', icon: IconComponent, solid, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        solid ? SOLID_TONE_CLASSES[tone] : TONE_CLASSES[tone]
      } ${className}`}
    >
      {IconComponent && <IconComponent size={13} weight="fill" />}
      {children}
    </span>
  );
}
