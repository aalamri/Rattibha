/* Rattibha marketing site — shared tokens, logo, primitives, data. */

const C = {
  cream: '#FAF7F2', surface: '#FFFFFF', ink: '#2B2233', fg2: '#5C5266', fg3: '#877E92',
  brand: '#4B0082', brandHover: '#3D0069', rose50: '#F2EAF7', rose100: '#E4D4EF', rose700: '#2E014F',
  lavender: '#B6A1D4', lavender100: '#EAE2F4',
  gold: '#DAA520', gold200: '#F2E2A6', plum: '#2B2233', plum700: '#41324F',
  emerald: '#2E9E68', emerald100: '#DCEFE4', border: '#E9E1EE', borderStrong: '#D8CDE0',
  warm50: '#F4F0EA', warm100: '#ECE6DE', info: '#4B0082', infoBg: '#F2EAF7',
};
const SANS = "'Poppins','Tajawal',system-ui,sans-serif";
const DISPLAY = "'Playfair Display','El Messiri',serif";

const GRADS = [
  'linear-gradient(135deg,#7E3FAE,#2E014F)',
  'linear-gradient(135deg,#7E3FAE,#3D0069)',
  'linear-gradient(140deg,#B6A1D4,#4B0082)',
  'linear-gradient(135deg,#DAA520,#4B0082)',
  'linear-gradient(135deg,#4B0082,#21013A)',
  'linear-gradient(135deg,#A875C9,#2E014F)',
];
function Photo({ seed = 0, style = {}, children, label }) {
  return (
    <div style={{ position: 'relative', background: GRADS[seed % GRADS.length],
      display: 'flex', alignItems: 'flex-end', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,0.25)', fontSize: 36 }}><i className="ph ph-image" /></div>
      {label && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700,
        color: '#fff', background: 'rgba(43,34,51,0.4)', padding: '4px 10px', borderRadius: 999,
        backdropFilter: 'blur(4px)' }}>{label}</span>}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</div>
    </div>
  );
}

function Logo({ dark = false, size = 38 }) {
  return (
    <img src={dark ? "../../assets/logo-wordmark-light.png" : "../../assets/logo-wordmark.png"}
      alt="رتّبها · Rattibha" style={{ height: size * 0.95, width: 'auto', display: 'block' }} />
  );
}

function Badge({ children, bg = C.rose100, fg = C.rose700, icon }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', fontSize: 12.5, fontWeight: 700,
      padding: '4px 11px', borderRadius: 999, background: bg, color: fg, fontFamily: SANS, whiteSpace: 'nowrap' }}>
      {icon && <i className={icon} style={{ fontSize: 14 }} />}{children}
    </span>
  );
}

function Btn({ children, variant = 'primary', icon, size = 'md', style = {}, onClick }) {
  const base = { fontFamily: SANS, fontWeight: 700, border: '1.5px solid transparent', borderRadius: 13,
    cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s', padding: size === 'lg' ? '15px 26px' : size === 'sm' ? '8px 15px' : '12px 20px',
    fontSize: size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15 };
  const v = {
    primary: { background: C.brand, color: '#FBF7FF', boxShadow: '0 12px 26px -12px rgba(75,0,130,0.55)' },
    gold: { background: C.gold, color: C.plum },
    secondary: { background: C.surface, color: C.ink, borderColor: C.borderStrong },
    ghost: { background: 'transparent', color: C.ink },
    light: { background: 'rgba(255,255,255,0.14)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' },
  }[variant];
  return (
    <button onClick={onClick} style={{ ...base, ...v, ...style }}>
      {icon && <i className={icon} style={{ fontSize: 18 }} />}{children}
    </button>
  );
}

function Avatar({ seed = 0, size = 44, initials }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, background: GRADS[seed % GRADS.length],
      display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.36, fontFamily: SANS }}>
      {initials}
    </div>
  );
}

const PLANNERS = [
  { name: 'Lumière Events', city: 'Riyadh', type: 'Weddings & Galas', rating: 4.9, from: 18000, seed: 0, premium: true },
  { name: 'Coral Coast Events', city: 'Jeddah', type: 'Galas', rating: 4.7, from: 19000, seed: 5, premium: true },
  { name: 'Noor Weddings', city: 'Makkah', type: 'Weddings', rating: 4.9, from: 16000, seed: 3, premium: true },
  { name: 'Marina Celebrations', city: 'Khobar', type: 'Engagements', rating: 4.8, from: 11000, seed: 1, premium: true },
  { name: 'Saffron Events', city: 'Madinah', type: 'Weddings & Galas', rating: 4.7, from: 13500, seed: 5, premium: false },
  { name: 'Rose Valley Events', city: 'Taif', type: 'Weddings', rating: 4.9, from: 10500, seed: 4, premium: false },
  { name: 'Orbit Corporate', city: 'Riyadh', type: 'Corporate', rating: 4.7, from: 25000, seed: 2, premium: true },
  { name: 'Zahra Parties', city: 'Dammam', type: 'Birthdays', rating: 4.9, from: 3200, seed: 4, premium: false },
];
const CATS = [
  { label: 'Weddings', icon: 'ph-heart-straight', n: '180+ planners', color: '#4B0082', tint: '#F2EAF7' },
  { label: 'Birthdays', icon: 'ph-cake', n: '120+ planners', color: '#B5881A', tint: '#F6E7C4' },
  { label: 'Engagements', icon: 'ph-balloon', n: '90+ planners', color: '#7B4FB0', tint: '#EADFF7' },
  { label: 'Corporate', icon: 'ph-briefcase', n: '70+ planners', color: '#3D0069', tint: '#E4D4EF' },
  { label: 'Galas', icon: 'ph-champagne', n: '45+ planners', color: '#DAA520', tint: '#F2E2A6' },
];
const STEPS = [
  { icon: 'ph-list-checks', t: 'Tell us your vision', d: 'Share your event type, date, city and budget in under two minutes.' },
  { icon: 'ph-sparkle', t: 'Get matched instantly', d: 'We surface verified planners that fit your style — compare and message directly.' },
  { icon: 'ph-confetti', t: 'Book & celebrate', d: 'Secure your date with a protected deposit and enjoy a perfectly coordinated day.' },
];
const QUOTES = [
  { who: 'Noura A.', role: 'Bride · Riyadh', seed: 1, text: 'Rattibha matched us with a planner who understood our vision instantly. Our wedding was flawless.' },
  { who: 'Khalid M.', role: 'HR Lead · Orbit Co.', seed: 2, text: 'Booked our entire annual celebration in a week. Professional, transparent, stress-free.' },
  { who: 'Sara H.', role: 'Mother · Dammam', seed: 4, text: 'The birthday party exceeded every expectation. Booking and paying was effortless.' },
];

Object.assign(window, { C, SANS, DISPLAY, Photo, Logo, Badge, Btn, Avatar, PLANNERS, CATS, STEPS, QUOTES });
