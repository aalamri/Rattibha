'use client';

import { ArrowLeft } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { useIsRTL } from '@/i18n/useIsRTL';

interface DetailHeaderProps {
  onBack?: () => void;
  crumb: ReactNode;
  children?: ReactNode;
}

export function DetailHeader({ onBack, crumb, children }: DetailHeaderProps) {
  const router = useRouter();
  const isRTL = useIsRTL();

  return (
    <div className="mb-5 flex items-center gap-3.5">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md border border-border bg-bg-surface"
      >
        <ArrowLeft size={18} className={`text-fg1 ${isRTL ? 'rotate-180' : ''}`} />
      </button>
      <div className="text-[13px] text-fg3">{crumb}</div>
      <div className="ms-auto flex gap-2.5">{children}</div>
    </div>
  );
}
