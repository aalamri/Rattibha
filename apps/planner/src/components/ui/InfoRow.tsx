import type { Icon } from 'phosphor-react';
import type { ReactNode } from 'react';

interface InfoRowProps {
  icon: Icon;
  label: ReactNode;
  value: ReactNode;
  last?: boolean;
}

export function InfoRow({ icon: IconComponent, label, value, last }: InfoRowProps) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${last ? '' : 'border-b border-border'}`}>
      <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-sm bg-purple-50">
        <IconComponent size={17} className="text-brand" />
      </div>
      <span className="flex-1 text-[13.5px] text-fg2">{label}</span>
      <span className="text-[13.5px] font-semibold text-fg1">{value}</span>
    </div>
  );
}
