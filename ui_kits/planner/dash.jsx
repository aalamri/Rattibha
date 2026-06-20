/* Rattibha — Planner Dashboard (web). Shared tokens, primitives, data, shell.
   Brand: Royal Purple + Soft Gold + Lavender on white. Playfair + Poppins. */

const C = {
  bg: '#F7F4FA', surface: '#FFFFFF', ink: '#2B2233', fg2: '#5C5266', fg3: '#877E92',
  brand: '#5B2C83', brandHover: '#4A2369', purple50: '#F3EDF8', purple100: '#E7DBF1', purple700: '#3A1B52',
  lavender: '#B6A1D4', lavender100: '#EAE2F4',
  gold: '#D4AF37', gold100: '#F6E7C4', gold600: '#B5922A',
  emerald: '#2E9E68', emerald100: '#DCEFE4', danger: '#C24436', danger100: '#F6DED9',
  amber: '#C9871F', amber100: '#F7E8C9',
  border: '#ECE4F1', borderStrong: '#DCD0E4',
};
const SANS = "'Poppins','Tajawal',system-ui,sans-serif";
const DISPLAY = "'Playfair Display','El Messiri',serif";

const GRADS = [
  'linear-gradient(135deg,#6E3A9C,#3A1B52)',
  'linear-gradient(135deg,#8456AE,#4A2369)',
  'linear-gradient(140deg,#B6A1D4,#5B2C83)',
  'linear-gradient(135deg,#D4AF37,#5B2C83)',
  'linear-gradient(135deg,#A985C9,#3A1B52)',
  'linear-gradient(135deg,#9C82C2,#2B1440)',
];

function Avatar({ seed = 0, size = 40, initials, ring }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, background: GRADS[seed % GRADS.length],
      display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38, fontFamily: SANS,
      border: ring ? `2px solid ${C.surface}` : 'none', boxShadow: ring ? '0 0 0 1.5px '+C.border : 'none' }}>
      {initials}
    </div>
  );
}

function Photo({ seed = 0, style = {}, children }) {
  return (
    <div style={{ position: 'relative', background: GRADS[seed % GRADS.length], overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end', ...style }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,0.25)', fontSize: 26 }}><i className="ph ph-image" /></div>
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</div>
    </div>
  );
}

function Badge({ children, tone = 'purple', icon, solid }) {
  const tones = {
    purple: [C.purple50, C.brand], gold: [C.gold100, C.gold600], green: [C.emerald100, C.emerald],
    amber: [C.amber100, C.amber], red: [C.danger100, C.danger], gray: ['#EEEAF2', C.fg2], lav: [C.lavender100, '#6F539C'],
  }[tone];
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', fontSize: 12, fontWeight: 600,
      padding: '3px 10px', borderRadius: 999, fontFamily: SANS, whiteSpace: 'nowrap',
      background: solid ? tones[1] : tones[0], color: solid ? '#fff' : tones[1] }}>
      {icon && <i className={icon} style={{ fontSize: 13 }} />}{children}
    </span>
  );
}

function Btn({ children, variant = 'primary', icon, iconRight, size = 'md', onClick, style = {} }) {
  const base = { fontFamily: SANS, fontWeight: 600, border: '1.5px solid transparent', borderRadius: 11,
    cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'center',
    transition: 'all .18s', padding: size === 'sm' ? '8px 13px' : size === 'lg' ? '13px 22px' : '10px 17px',
    fontSize: size === 'sm' ? 13 : 14.5, whiteSpace: 'nowrap' };
  const v = {
    primary: { background: C.brand, color: '#fff', boxShadow: '0 8px 18px -10px rgba(91,44,131,0.5)' },
    gold: { background: C.gold, color: C.ink },
    secondary: { background: C.surface, color: C.ink, borderColor: C.borderStrong },
    ghost: { background: 'transparent', color: C.brand },
    danger: { background: C.danger100, color: C.danger },
  }[variant];
  return (
    <button onClick={onClick} style={{ ...base, ...v, ...style }}>
      {icon && <i className={icon} style={{ fontSize: 17 }} />}{children}
      {iconRight && <i className={iconRight} style={{ fontSize: 17 }} />}
    </button>
  );
}

function Card({ children, style = {}, pad = 20 }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: pad,
      boxShadow: '0 6px 20px -16px rgba(43,34,51,0.3)', ...style }}>{children}</div>
  );
}

/* ── Data ─────────────────────────────────────────────────────── */
const PLANNER = { name: 'Lumière Events', city: 'Riyadh', seed: 0, initials: 'L', tier: 'Premium', rating: 4.9, reviews: 168 };

const NAV = [
  { key: 'overview', label: 'Overview', icon: 'ph-squares-four' },
  { key: 'browse', label: 'Open requests', icon: 'ph-megaphone', badge: 6 },
  { key: 'leads', label: 'My Offers', icon: 'ph-tray-arrow-down', badge: 4 },
  { key: 'bookings', label: 'Bookings', icon: 'ph-calendar-check' },
  { key: 'calendar', label: 'Calendar', icon: 'ph-calendar-dots' },
  { key: 'messages', label: 'Messages', icon: 'ph-chat-circle', badge: 2 },
  { key: 'earnings', label: 'Earnings', icon: 'ph-wallet' },
  { key: 'profile', label: 'Profile', icon: 'ph-storefront' },
];

const LEADS = [
  { id: 'l1', name: 'Noura Al-Qahtani', initials: 'N', seed: 1, type: 'Wedding', date: '14 Mar 2026', city: 'Riyadh',
    guests: 220, budget: '18,000–25,000', posted: '20m ago', status: 'offer-sent', quote: '22,000', offerStatus: 'pending', sent: '15m ago',
    note: 'Looking for an elegant garden wedding in soft rose & gold. Full planning + décor.' },
  { id: 'l2', name: 'Faisal Group', initials: 'F', seed: 2, type: 'Corporate', date: '02 May 2026', city: 'Riyadh',
    guests: 400, budget: '40,000+', posted: '1h ago', status: 'offer-sent', quote: '46,000', offerStatus: 'viewed', sent: '50m ago',
    note: 'Annual celebration & awards night for 400 staff. Stage, AV and catering.' },
  { id: 'l3', name: 'Sara Hassan', initials: 'S', seed: 4, type: 'Engagement', date: '28 Mar 2026', city: 'Jeddah',
    guests: 120, budget: '9,000–14,000', posted: '3h ago', status: 'offer-sent', quote: '13,500', offerStatus: 'accepted', sent: '2h ago',
    note: 'Intimate engagement, modern romantic styling.' },
  { id: 'l4', name: 'Mona Khalid', initials: 'M', seed: 5, type: 'Birthday', date: '10 Apr 2026', city: 'Riyadh',
    guests: 60, budget: '5,000–8,000', posted: '5h ago', status: 'offer-sent', quote: '6,800', offerStatus: 'declined', sent: '4h ago',
    note: 'Daughter’s 7th birthday — princess theme, balloons & cake.' },
];

const BOOKINGS = [
  { id: 'b1', client: 'Aisha & Omar', initials: 'A', seed: 1, pkg: 'Signature Wedding', date: '14 Mar 2026',
    value: 24000, paid: 4800, status: 'confirmed', stage: 'Planning' },
  { id: 'b2', client: 'Orbit Co.', initials: 'O', seed: 2, pkg: 'Annual Celebration', date: '02 May 2026',
    value: 38000, paid: 7600, status: 'confirmed', stage: 'Design' },
  { id: 'b3', client: 'Layla Ahmed', initials: 'L', seed: 4, pkg: 'Grand Engagement', date: '28 Mar 2026',
    value: 16000, paid: 0, status: 'pending', stage: 'Awaiting deposit' },
  { id: 'b4', client: 'The Al-Rashid Family', initials: 'R', seed: 5, pkg: 'Birthday Bash', date: '10 Apr 2026',
    value: 6800, paid: 6800, status: 'confirmed', stage: 'Final walkthrough' },
];

const MESSAGES = [
  { who: 'Aisha & Omar', seed: 1, initials: 'A', last: 'Perfect, the moodboard looks beautiful! 💜', time: '4m', unread: 2, online: true },
  { who: 'Orbit Co.', seed: 2, initials: 'O', last: 'Can we add a second stage screen?', time: '1h', unread: 0 },
  { who: 'Noura Al-Qahtani', seed: 3, initials: 'N', last: 'Thank you for the quick offer!', time: '2h', unread: 0 },
  { who: 'Layla Ahmed', seed: 4, initials: 'L', last: 'We’ll confirm the deposit today.', time: '1d', unread: 0 },
];

const ACTIVITY = [
  { icon: 'ph-tray-arrow-down', tone: 'purple', t: 'New lead from Noura Al-Qahtani', d: 'Wedding · 220 guests', time: '20m' },
  { icon: 'ph-seal-check', tone: 'green', t: 'Booking confirmed — Aisha & Omar', d: 'Deposit SAR 4,800 received', time: '2h' },
  { icon: 'ph-star', tone: 'gold', t: 'New 5-star review from Mona K.', d: '“Magical birthday, flawless execution.”', time: '6h' },
  { icon: 'ph-chat-circle', tone: 'lav', t: 'Orbit Co. sent a message', d: '“Can we add a second stage screen?”', time: '1d' },
];

Object.assign(window, { C, SANS, DISPLAY, GRADS, Avatar, Photo, Badge, Btn, Card,
  PLANNER, NAV, LEADS, BOOKINGS, MESSAGES, ACTIVITY });
