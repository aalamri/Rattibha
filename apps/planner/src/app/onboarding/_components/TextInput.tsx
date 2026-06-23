import type { Icon } from 'phosphor-react';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: Icon;
}

export function TextInput({ icon: IconComponent, className = '', ...rest }: TextInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-bg-app px-3.5 py-2.5">
      {IconComponent && <IconComponent size={17} className="text-fg3" />}
      <input className={`w-full bg-transparent text-[13.5px] text-fg1 outline-none ${className}`} {...rest} />
    </div>
  );
}
