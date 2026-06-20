export const GRADIENTS = [
  'linear-gradient(135deg,#6E3A9C,#3A1B52)',
  'linear-gradient(135deg,#8456AE,#4A2369)',
  'linear-gradient(140deg,#B6A1D4,#5B2C83)',
  'linear-gradient(135deg,#D4AF37,#5B2C83)',
  'linear-gradient(135deg,#A985C9,#3A1B52)',
  'linear-gradient(135deg,#9C82C2,#2B1440)',
];

interface AvatarProps {
  seed?: number;
  size?: number;
  initials: string;
  ring?: boolean;
  className?: string;
}

export function Avatar({ seed = 0, size = 40, initials, ring, className = '' }: AvatarProps) {
  return (
    <div
      className={`grid flex-shrink-0 place-items-center rounded-full font-semibold text-white ${
        ring ? 'ring-2 ring-bg-surface' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: GRADIENTS[seed % GRADIENTS.length],
      }}
    >
      {initials}
    </div>
  );
}
