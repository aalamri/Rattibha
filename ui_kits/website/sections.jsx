/* Rattibha marketing site — sections. Uses globals from site.jsx. */
const WRAP = { maxWidth: 1180, margin: '0 auto', padding: '0 40px' };

function NavBar({ lang, setLang }) {
  const links = ['Browse planners', 'How it works', 'For planners', 'About'];
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ ...WRAP, display: 'flex', alignItems: 'center', gap: 28, height: 74 }}>
        <Logo size={38} />
        <div style={{ display: 'flex', gap: 26, marginInlineStart: 18 }}>
          {links.map(l => <span key={l} style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600,
            color: C.fg2, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tr(l)}</span>)}
        </div>
        <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{ all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 14, fontWeight: 700,
            color: C.ink, border: `1.5px solid ${C.borderStrong}`, borderRadius: 999, padding: '7px 13px' }}>
            <i className="ph ph-globe" style={{ fontSize: 16 }} />{lang === 'en' ? 'العربية' : 'English'}
          </button>
          <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.ink, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tr('Sign in')}</span>
          <Btn size="sm" icon="ph-sparkle" style={{ whiteSpace: 'nowrap' }}>{tr('Get started')}</Btn>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* faint dot motif */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
        backgroundSize: '64px', opacity: 0.13, pointerEvents: 'none' }} />
      {/* oversized ر glyph watermark, bleeding off the top-right */}
      <img src="../../assets/glyph-ra.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', top: -56, right: -40, width: 360, height: 'auto', opacity: 0.16,
          transform: 'rotate(-8deg)', pointerEvents: 'none' }} />
      <div style={{ ...WRAP, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48,
        alignItems: 'center', padding: '64px 40px 72px', position: 'relative' }}>
        <div>
          <Badge bg={C.gold200} fg="#7a5a14" icon="ph-fill ph-star">{tr('Trusted by 12,000+ celebrations')}</Badge>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 66, fontWeight: 600, lineHeight: 1.02, color: C.ink,
            margin: '18px 0 0', letterSpacing: '-0.02em' }}>
            {tr('Plan a celebration')}<br/>{tr('worth')} <span style={{ color: C.brand, fontStyle: 'italic' }}>{tr('remembering')}</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: C.fg2, margin: '20px 0 0', maxWidth: 460 }}>
            {tr("Rattibha connects you with the Gulf's most trusted event planners — for weddings, engagements, birthdays and corporate galas. Compare, message and book with confidence.")}
          </p>

          {/* search bar */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, background: C.surface, marginTop: 30,
            border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: '0 18px 44px -22px rgba(43,34,51,0.3)',
            overflow: 'hidden', maxWidth: 560 }}>
            <SearchSeg icon="ph-confetti" label={tr('Event')} value={tr('Wedding')} />
            <Divider />
            <SearchSeg icon="ph-map-pin" label={tr('City')} value={tr('Riyadh')} />
            <Divider />
            <SearchSeg icon="ph-calendar-blank" label={tr('Date')} value={tr('Mar 2026')} />
            <button style={{ background: C.brand, border: 'none', color: '#fff', padding: '0 22px', cursor: 'pointer',
              display: 'grid', placeItems: 'center', margin: 6, borderRadius: 11 }}>
              <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 21 }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24 }}>
            <div style={{ display: 'flex' }}>
              {[1,2,4,3].map((s, i) => <div key={i} style={{ marginLeft: i ? -12 : 0 }}>
                <Avatar seed={s} size={38} initials="" /></div>)}
            </div>
            <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>
              <b style={{ color: C.ink }}>4.9/5</b> {tr('from 8,400+ reviews')}
            </span>
          </div>
        </div>

        {/* collage */}
        <div style={{ position: 'relative', height: 460 }}>
          <Photo seed={0} style={{ position: 'absolute', top: 0, left: 24, width: 250, height: 320,
            borderRadius: 22, boxShadow: '0 30px 60px -28px rgba(43,34,51,0.45)' }} label={tr('Weddings')} />
          <Photo seed={4} style={{ position: 'absolute', top: 150, right: 0, width: 210, height: 250,
            borderRadius: 22, boxShadow: '0 30px 60px -28px rgba(43,34,51,0.45)' }} label={tr('Galas')} />
          {/* floating planner pill */}
          <div style={{ position: 'absolute', bottom: 6, left: 0, background: C.surface, borderRadius: 16,
            padding: 12, boxShadow: '0 20px 44px -18px rgba(43,34,51,0.4)', display: 'flex', gap: 11,
            alignItems: 'center', border: `1px solid ${C.border}`, width: 250 }}>
            <Photo seed={2} style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>{trPlanner({name:'Lumière Events'}, 'name')}</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{tr('Riyadh')} · {tr('Weddings')}</div>
            </div>
            <Badge bg={C.gold200} fg="#7a5a14" icon="ph-fill ph-star">4.9</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
function SearchSeg({ icon, label, value }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '13px 16px' }}>
      <i className={`ph ${icon}`} style={{ fontSize: 19, color: C.brand }} />
      <div>
        <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: C.fg3, textTransform: 'uppercase',
          letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{value}</div>
      </div>
    </div>
  );
}
function Divider() { return <div style={{ width: 1, background: C.border, margin: '12px 0' }} />; }

function Categories() {
  return (
    <div style={{ ...WRAP, padding: '8px 40px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
        {CATS.map(c => (
          <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18,
            padding: '22px 18px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
            boxShadow: '0 8px 22px -16px rgba(43,34,51,0.2)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c.tint, display: 'grid',
              placeItems: 'center', margin: '0 auto 12px' }}>
              <i className={`ph ${c.icon}`} style={{ fontSize: 26, color: c.color }} />
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: C.ink }}>{tr(c.label)}</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 2 }}>{tr(c.n)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlannerCard({ p }) {
  return (
    <div style={{ background: C.surface, borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.border}`,
      boxShadow: '0 14px 34px -20px rgba(43,34,51,0.28)' }}>
      <Photo seed={p.seed} style={{ height: 168 }} label={p.premium ? tr('★ Premium') : null}>
        <span />
      </Photo>
      <div style={{ padding: '15px 17px 17px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{trPlanner(p, 'name')}</span>
          <span style={{ flexShrink: 0 }}><Badge bg={C.gold200} fg="#7a5a14" icon="ph-fill ph-star">{p.rating}</Badge></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 13, color: C.fg2,
          marginTop: 4 }}>
          <i className="ph ph-map-pin" style={{ fontSize: 15 }} />{trPlanner(p, 'city')} · {trPlanner(p, 'type')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('from')} <b style={{ color: C.ink,
            fontSize: 15 }}>SAR {p.from.toLocaleString()}</b></span>
          <Btn size="sm">{tr('View profile')}</Btn>
        </div>
      </div>
    </div>
  );
}

function FeaturedGrid() {
  return (
    <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ ...WRAP, padding: '64px 40px' }}>
        <SectionHead over={tr('Curated for you')} title={tr('Featured planners')} sub={tr('Hand-picked, verified studios with proven track records.')}
          action={tr('Browse all 500+')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22, marginTop: 32 }}>
          {PLANNERS.map((p, i) => <PlannerCard key={i} p={p} />)}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ over, title, sub, action, center }) {
  const overEl = <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: C.gold }}>{over}</div>;
  const titleEl = <h2 style={{ fontFamily: DISPLAY, fontSize: 42, fontWeight: 600, color: C.ink,
    margin: '10px 0 0', lineHeight: 1.08, letterSpacing: '-0.01em' }}>{title}</h2>;
  const subEl = sub && <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: C.fg2,
    margin: '12px 0 0' }}>{sub}</p>;
  if (center) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        {overEl}{titleEl}{subEl}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
      <div>{overEl}{titleEl}{subEl}</div>
      {action && <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.brand,
        whiteSpace: 'nowrap', cursor: 'pointer' }}>{action} →</span>}
    </div>
  );
}

function HowItWorks() {
  return (
    <div style={{ ...WRAP, padding: '72px 40px' }}>
      <SectionHead center over={tr('Simple by design')} title={tr('Three steps to a perfect event')}
        sub={tr('From first idea to final toast, Rattibha keeps every detail coordinated.')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 44 }}>
        {STEPS.map((s, i) => {
          const tones = [
            { tile: '#4B0082', tint: '#F2EAF7' },
            { tile: '#7E3FAE', tint: '#EADFF7' },
            { tile: '#B5881A', tint: '#F6E7C4' },
          ][i];
          return (
          <div key={i} style={{ position: 'relative', padding: '4px 4px' }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: tones.tile, display: 'grid',
              placeItems: 'center', marginBottom: 18, position: 'relative' }}>
              <i className={`ph ${s.icon}`} style={{ fontSize: 28, color: '#fff' }} />
              <span style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, borderRadius: 999,
                background: C.gold, color: C.plum, fontFamily: SANS, fontSize: 13, fontWeight: 800,
                display: 'grid', placeItems: 'center' }}>{i + 1}</span>
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 600, color: C.ink, margin: 0 }}>{tr(s.t)}</h3>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: C.fg2, margin: '8px 0 0' }}>{tr(s.d)}</p>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ ...WRAP, padding: '64px 40px' }}>
        <SectionHead center over={tr('Loved across the Gulf')} title={tr('Celebrations, perfectly coordinated')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginTop: 40 }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 20,
              padding: 26, boxShadow: '0 12px 30px -20px rgba(43,34,51,0.25)' }}>
              <div style={{ color: C.gold, fontSize: 17, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontFamily: DISPLAY, fontSize: 21, lineHeight: 1.4, color: C.ink, fontWeight: 500,
                margin: '14px 0 20px' }}>"{trQuote(q, 'text')}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar seed={q.seed} size={44} initials={q.who[0]} />
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14.5, color: C.ink }}>{trQuote(q, 'who')}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{trQuote(q, 'role')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTABand() {
  return (
    <div style={{ ...WRAP, padding: '72px 40px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 30, background: C.ink,
        padding: '56px 56px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '60px', opacity: 0.1, filter: 'brightness(0) invert(1)' }} />
        {/* big ر glyph bleeding off the right */}
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', right: -28, bottom: -48, width: 300, height: 'auto', opacity: 0.3,
            transform: 'rotate(-6deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 40 }}>
          <div style={{ maxWidth: 560 }}>
            <Badge bg="rgba(255,255,255,0.12)" fg={C.gold} icon="ph-fill ph-crown-simple">{tr('For event planners')}</Badge>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 44, fontWeight: 600, color: '#EFE9F3', margin: '16px 0 0',
              lineHeight: 1.04 }}>{tr('Grow your events business with Rattibha')}</h2>
            <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.55, color: 'rgba(244,232,223,0.75)',
              margin: '14px 0 0' }}>{tr('Reach thousands of clients planning their next celebration. Manage bookings, payments and reviews from one beautiful dashboard.')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <Btn variant="gold" size="lg" icon="ph-rocket-launch" onClick={() => { window.location.href = '../planner/onboarding.html'; }}>{tr('Become a planner')}</Btn>
            <Btn variant="light" size="lg">{tr('Talk to sales')}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const cols = {
    Customers: ['Browse planners', 'How it works', 'Pricing', 'Reviews'],
    Planners: ['Join Rattibha', 'Planner dashboard', 'Success stories', 'Resources'],
    Company: ['About us', 'Careers', 'Press', 'Contact'],
  };
  return (
    <div style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ ...WRAP, padding: '56px 40px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 32 }}>
        <div>
          <Logo size={40} />
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.55, margin: '16px 0 16px',
            maxWidth: 280 }}>{tr("The Gulf's marketplace for unforgettable events. Plan, celebrate, cherish.")}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['ph-instagram-logo', 'ph-x-logo', 'ph-tiktok-logo', 'ph-snapchat-logo'].map(ic => (
              <div key={ic} style={{ width: 38, height: 38, borderRadius: 999, border: `1.5px solid ${C.borderStrong}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <i className={`ph ${ic}`} style={{ fontSize: 18, color: C.ink }} />
              </div>
            ))}
          </div>
        </div>
        {Object.entries(cols).map(([h, items]) => (
          <div key={h}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 14 }}>{tr(h)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(i => <span key={i} style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2,
                cursor: 'pointer' }}>{tr(i)}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...WRAP, padding: '18px 40px', borderTop: `1px solid ${C.border}`, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('© 2026 Rattibha · رتّبها. All rights reserved.')}</span>
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('Privacy · Terms · صُنع بحُبّ في الخليج')}</span>
      </div>
    </div>
  );
}

Object.assign(window, { NavBar, Hero, Categories, FeaturedGrid, HowItWorks, Testimonials, CTABand, Footer });
