import type { Icon } from 'phosphor-react';

interface BadgeProps {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  icon?: Icon;
  className?: string;
  style?: React.CSSProperties;
}

/** Small pill label — matches `Badge` in site.jsx. */
export function Badge({ children, bg = '#E4D4EF', fg = '#2E014F', icon: IconComp, className = '', style }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[12.5px] font-bold ${className}`}
      style={{ background: bg, color: fg, ...style }}
    >
      {IconComp && <IconComp size={14} weight="fill" />}
      {children}
    </span>
  );
}
