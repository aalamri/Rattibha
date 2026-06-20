import type { Icon } from 'phosphor-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-brand hover:bg-brand-hover active:bg-brand-press',
  gold: 'bg-gold-500 text-fg1 hover:brightness-95',
  secondary: 'border-border-strong bg-bg-surface text-fg1 hover:bg-bg-app',
  ghost: 'border-transparent bg-transparent text-brand hover:bg-purple-50',
  danger: 'border-transparent bg-danger-bg text-danger hover:brightness-95',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'gap-1.5 px-3.5 py-2 text-[13px]',
  md: 'gap-2 px-[17px] py-2.5 text-[14.5px]',
  lg: 'gap-2 px-[22px] py-[13px] text-[15px]',
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 15, md: 17, lg: 18 };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  iconRight?: Icon;
  children?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: IconStart,
  iconRight: IconEnd,
  className = '',
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZE[size];
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md border-[1.5px] font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {IconStart && <IconStart size={iconSize} />}
      {children}
      {IconEnd && <IconEnd size={iconSize} />}
    </button>
  );
}
