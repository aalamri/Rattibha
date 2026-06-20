import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?: number;
}

export function Card({ children, className = '', pad = 20, style, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-bg-surface shadow-card ${className}`}
      style={{ padding: pad, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
