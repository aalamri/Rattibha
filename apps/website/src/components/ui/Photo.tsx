import { Image as ImageIcon } from 'phosphor-react';

const GRADIENTS = [
  'linear-gradient(135deg,#7E3FAE,#2E014F)',
  'linear-gradient(135deg,#7E3FAE,#3D0069)',
  'linear-gradient(140deg,#B6A1D4,#4B0082)',
  'linear-gradient(135deg,#DAA520,#4B0082)',
  'linear-gradient(135deg,#4B0082,#21013A)',
  'linear-gradient(135deg,#A875C9,#2E014F)',
];

interface PhotoProps {
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  children?: React.ReactNode;
}

/** Gradient placeholder for a planner/event photo — matches `Photo` in site.jsx.
 * The label uses `start-3` (a logical CSS property), which the browser mirrors
 * automatically for `dir="rtl"` — no isRTL prop needed, unlike the React
 * Native apps where `left`/`right` never auto-mirror. */
export function Photo({ seed = 0, className = '', style, label, children }: PhotoProps) {
  return (
    <div
      className={`relative flex items-end overflow-hidden ${className}`}
      style={{ background: GRADIENTS[seed % GRADIENTS.length], ...style }}
    >
      <div className="absolute inset-0 grid place-items-center text-white/25">
        <ImageIcon size={36} />
      </div>
      {label && (
        <span className="absolute start-3 top-3 rounded-full bg-[rgba(43,34,51,0.4)] px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          {label}
        </span>
      )}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
