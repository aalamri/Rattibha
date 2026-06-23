import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[12.5px] font-semibold text-fg2">{label}</div>
      {children}
      {hint && <div className="mt-1.5 text-[11.5px] text-fg3">{hint}</div>}
    </div>
  );
}
