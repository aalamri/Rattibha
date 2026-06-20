'use client';

import type { Icon } from 'phosphor-react';

export function EmptyState({
  icon: IconComp,
  title,
  subtitle,
  children,
}: {
  icon: Icon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-purple-50">
        <IconComp size={28} weight="fill" className="text-brand" />
      </div>
      <div className="font-display text-lg font-semibold text-fg1">{title}</div>
      {subtitle && <p className="max-w-sm text-[13px] text-fg3">{subtitle}</p>}
      {children}
    </div>
  );
}
