import Image from 'next/image';

// Actual file is 312×104px (3:1).
const ASPECT_RATIO = 312 / 104;

export function Logo({ dark = false, size = 38 }: { dark?: boolean; size?: number }) {
  const height = Math.round(size * 0.95);
  return (
    <Image
      src={dark ? '/logo-wordmark-light.png' : '/logo-wordmark.png'}
      alt="رتّبها · Ratibha"
      height={height}
      width={Math.round(height * ASPECT_RATIO)}
      priority
    />
  );
}
