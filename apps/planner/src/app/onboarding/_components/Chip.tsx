import type { Icon } from 'phosphor-react';
import type { ReactNode } from 'react';

interface ChipProps {
  on: boolean;
  onClick: () => void;
  icon?: Icon;
  children: ReactNode;
}

export function Chip({ on, onClick, icon: IconComponent, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
        on ? 'border-brand bg-purple-50 text-brand' : 'border-border-strong bg-bg-surface text-fg1'
      }`}
    >
      {IconComponent && <IconComponent size={16} />}
      {children}
    </button>
  );
}
