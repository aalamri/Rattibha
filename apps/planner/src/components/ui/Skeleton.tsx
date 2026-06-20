'use client';

export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--color-background-tertiary,#e5e0f0)] ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card,20px)] border border-border bg-bg-surface p-5 ${className}`}>
      {children}
    </div>
  );
}
