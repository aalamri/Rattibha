import type { Icon } from 'phosphor-react';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'light' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-[#FBF7FF] shadow-brand border-transparent hover:bg-brand-hover',
  gold: 'bg-gold-500 text-fg1 border-transparent hover:brightness-95',
  secondary: 'bg-bg-surface text-fg1 border-border-strong hover:bg-bg-app',
  ghost: 'bg-transparent text-fg1 border-transparent hover:bg-bg-app',
  light: 'bg-white/[0.14] text-white border-white/25 hover:bg-white/20',
  whatsapp: 'bg-[#25D366] text-white border-transparent hover:brightness-95',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'gap-2 px-4 py-2 text-[13.5px]',
  md: 'gap-2 px-5 py-3 text-[15px]',
  lg: 'gap-2.5 px-[26px] py-[15px] text-base',
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
}

/** Matches `Btn` in site.jsx. */
export function Button({ children, variant = 'primary', size = 'md', icon: IconComp, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[13px] border-[1.5px] font-bold transition-all ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {IconComp && <IconComp size={ICON_SIZE[size]} />}
      {children}
    </button>
  );
}
