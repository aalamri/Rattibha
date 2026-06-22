const GRADIENTS = [
  'linear-gradient(135deg,#7E3FAE,#2E014F)',
  'linear-gradient(135deg,#7E3FAE,#3D0069)',
  'linear-gradient(140deg,#B6A1D4,#4B0082)',
  'linear-gradient(135deg,#DAA520,#4B0082)',
  'linear-gradient(135deg,#4B0082,#21013A)',
  'linear-gradient(135deg,#A875C9,#2E014F)',
];

export function Avatar({ seed = 0, size = 44, initials = '' }: { seed?: number; size?: number; initials?: string }) {
  return (
    <div
      className="grid flex-shrink-0 place-items-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: GRADIENTS[seed % GRADIENTS.length] }}
    >
      {initials}
    </div>
  );
}
