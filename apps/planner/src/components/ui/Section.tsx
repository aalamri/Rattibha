import type { CSSProperties, ReactNode } from 'react';

import { Card } from './Card';

interface SectionProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Section({ title, action, children, style, className }: SectionProps) {
  return (
    <Card style={style} className={className}>
      {(title || action) && (
        <div className={`flex items-center justify-between ${title ? 'mb-4' : ''}`}>
          {title && <div className="text-[15px] font-semibold text-fg1">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}
