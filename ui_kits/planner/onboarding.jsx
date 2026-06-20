/* Rattibha — Planner Onboarding / Signup wizard.
   Full-screen flow: brand rail + stepped application → verification (pending) → go live.
   Uses globals from dash.jsx (C, SANS, DISPLAY, Btn, Badge, Avatar, Photo, GRADS). */

const STEPS = [
  { key: 'account', label: 'Account', icon: 'ph-user-circle' },
  { key: 'business', label: 'Business', icon: 'ph-storefront' },
  { key: 'services', label: 'Services', icon: 'ph-confetti' },
  { key: 'portfolio', label: 'Portfolio', icon: 'ph-images' },
  { key: 'verify', label: 'Verification', icon: 'ph-identification-card' },
];

/* ── small field primitives ──────────────────────────────────── */
function OField({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 7 }}>{label}</div>
      {children}
      {hint && <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}
function OInput({ value, icon, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface,
      border: `1.5px solid ${C.borderStrong}`, borderRadius: 12, padding: '12px 14px' }}>
      {icon && <i className={`ph ${icon}`} style={{ fontSize: 18, color: C.fg3 }} />}
      <span style={{ fontFamily: SANS, fontSize: 14, color: value ? C.ink : C.fg3, fontWeight: value ? 600 : 400 }}>
        {value || placeholder}</span>
    </div>
  );
}
function OChip({ on, onClick, icon, children }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      gap: 7, fontFamily: SANS, fontSize: 13.5, fontWeight: 600, padding: '9px 15px', borderRadius: 999,
      border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.purple50 : C.surface,
      color: on ? C.brand : C.ink }}>
      {icon && <i className={`ph ${icon}`} style={{ fontSize: 16 }} />}{children}
    </button>
  );
}

/* ── individual steps ────────────────────────────────────────── */
function StepAccount() {
  return (
    <div>
      <StepHead t="Create your planner account" d="This is how you’ll sign in to manage your business." />
      <OField label="Business / studio name"><OInput value="Lumière Events" icon="ph-storefront" /></OField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <OField label="Full name"><OInput value="Reem Al-Otaibi" icon="ph-user" /></OField>
        <OField label="Mobile number"><OInput value="+966 50 123 4567" icon="ph-phone" /></OField>
      </div>
      <OField label="Email"><OInput value="hello@lumiere.sa" icon="ph-envelope-simple" /></OField>
      <OField label="Password" hint="At least 8 characters with a number."><OInput value="••••••••••" icon="ph-lock-simple" /></OField>
    </div>
  );
}

function StepBusiness() {
  const [city, setCity] = React.useState('Riyadh');
  const [years, setYears] = React.useState('3–5 yrs');
  return (
    <div>
      <StepHead t="Tell us about your business" d="Helps us match you with the right clients." />
      <OField label="Primary city">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Madinah'].map(c => (
            <OChip key={c} on={city === c} onClick={() => setCity(c)} icon="ph-map-pin">{c}</OChip>
          ))}
        </div>
      </OField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <OField label="Team size"><OInput value="6–10 people" icon="ph-users-three" /></OField>
        <OField label="Years in business">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['<1 yr', '1–3 yrs', '3–5 yrs', '5+ yrs'].map(y => (
              <OChip key={y} on={years === y} onClick={() => setYears(y)}>{y}</OChip>
            ))}
          </div>
        </OField>
      </div>
      <OField label="Short bio" hint="Appears on your public storefront.">
        <div style={{ border: `1.5px solid ${C.borderStrong}`, borderRadius: 12, padding: '12px 14px',
          background: C.surface, fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.55, minHeight: 70 }}>
          Award-winning luxury wedding & gala studio crafting unforgettable celebrations across the Kingdom.
        </div>
      </OField>
    </div>
  );
}

function StepServices() {
  const [cats, setCats] = React.useState(['Weddings', 'Galas']);
  const [budget, setBudget] = React.useState('Premium');
  const toggle = (c) => setCats(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);
  const categories = [
    ['Weddings', 'ph-heart-straight'], ['Engagements', 'ph-balloon'], ['Birthdays', 'ph-cake'],
    ['Corporate', 'ph-briefcase'], ['Galas', 'ph-champagne'], ['Graduations', 'ph-graduation-cap'],
  ];
  return (
    <div>
      <StepHead t="What do you plan?" d="Select all the event types you specialise in." />
      <OField label="Event categories">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {categories.map(([c, ic]) => (
            <OChip key={c} on={cats.includes(c)} onClick={() => toggle(c)} icon={ic}>{c}</OChip>
          ))}
        </div>
      </OField>
      <OField label="Typical budget tier">
        <div style={{ display: 'flex', gap: 9 }}>
          {['Value', 'Mid-range', 'Premium', 'Luxury'].map(b => (
            <OChip key={b} on={budget === b} onClick={() => setBudget(b)}>{b}</OChip>
          ))}
        </div>
      </OField>
      <OField label="Starting price (SAR)" hint="The lowest package you offer.">
        <OInput value="12,000" icon="ph-currency-circle-dollar" />
      </OField>
    </div>
  );
}

function StepPortfolio() {
  return (
    <div>
      <StepHead t="Show your best work" d="Upload at least 4 photos from past events. These appear on your storefront." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[0,1,2,3].map(i => <Photo key={i} seed={i} style={{ height: 110, borderRadius: 14 }} />)}
        {[0,1].map(i => (
          <div key={'u'+i} style={{ height: 110, borderRadius: 14, border: `1.5px dashed ${C.borderStrong}`,
            background: C.purple50, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
            <i className="ph ph-plus" style={{ fontSize: 22, color: C.brand }} />
            <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: C.brand }}>Add photo</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.gold100, borderRadius: 12,
        padding: '12px 14px' }}>
        <i className="ph-fill ph-lightbulb" style={{ fontSize: 19, color: C.gold600 }} />
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: '#7a5e15', lineHeight: 1.45 }}>
          Studios with 8+ high-quality photos get <b>3× more</b> booking requests.</span>
      </div>
    </div>
  );
}

function StepVerify() {
  return (
    <div>
      <StepHead t="Verify your business" d="Required to receive payments. Your details stay private and secure." />
      <OField label="Commercial Registration (CR) number"><OInput value="1010 234 567" icon="ph-identification-badge" /></OField>
      <OField label="Upload documents" hint="CR certificate + owner ID (PDF or image).">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['CR certificate.pdf', true], ['Owner ID', false]].map(([name, done]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 11, border: `1.5px ${done ? 'solid' : 'dashed'} ${done ? C.border : C.borderStrong}`,
              borderRadius: 12, padding: '12px 14px', background: done ? C.surface : C.purple50 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: done ? C.emerald100 : '#fff',
                display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <i className={`ph-fill ${done ? 'ph-file-pdf' : 'ph-upload-simple'}`}
                  style={{ fontSize: 18, color: done ? C.emerald : C.brand }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{name}</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: done ? C.emerald : C.fg3 }}>
                  {done ? 'Uploaded · 1.2 MB' : 'Tap to upload'}</div>
              </div>
              {done
                ? <i className="ph-fill ph-check-circle" style={{ fontSize: 20, color: C.emerald }} />
                : <i className="ph ph-plus-circle" style={{ fontSize: 20, color: C.brand }} />}
            </div>
          ))}
        </div>
      </OField>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, cursor: 'pointer' }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: C.brand, display: 'grid',
          placeItems: 'center', flexShrink: 0 }}>
          <i className="ph-bold ph-check" style={{ fontSize: 14, color: '#fff' }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2, lineHeight: 1.4 }}>
          I agree to the <b style={{ color: C.brand }}>Partner Terms</b> & <b style={{ color: C.brand }}>Commission Policy</b>.</span>
      </label>
    </div>
  );
}

function StepHead({ t, d }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.15 }}>{t}</div>
      <p style={{ fontFamily: SANS, fontSize: 14, color: C.fg2, margin: '6px 0 0', lineHeight: 1.5 }}>{d}</p>
    </div>
  );
}

/* ── pending / success state ─────────────────────────────────── */
function PendingState({ onGoLive }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '0 60px', position: 'relative', overflow: 'hidden' }}>
      <img src="../../assets/glyph-ra.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', top: '12%', left: '50%', width: 280, opacity: 0.06,
          transform: 'translateX(-50%) rotate(-6deg)' }} />
      <div style={{ position: 'relative', maxWidth: 440 }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: C.purple50, display: 'grid',
          placeItems: 'center', margin: '0 auto 22px', position: 'relative' }}>
          <i className="ph-fill ph-paper-plane-tilt" style={{ fontSize: 46, color: C.brand }} />
          <div style={{ position: 'absolute', right: -4, bottom: -4, width: 36, height: 36, borderRadius: 999,
            background: C.gold, display: 'grid', placeItems: 'center', border: '3px solid #fff' }}>
            <i className="ph-fill ph-clock" style={{ fontSize: 18, color: C.ink }} />
          </div>
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
          Application submitted!
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15, color: C.fg2, lineHeight: 1.6, margin: '12px 0 24px' }}>
          Thanks, <b style={{ color: C.ink }}>Lumière Events</b>. Our team reviews most applications within
          <b style={{ color: C.ink }}> 24–48 hours</b>. We’ll email you the moment you’re verified and ready to receive leads.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left',
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 24 }}>
          {[['Account created', 'done'], ['Business details', 'done'], ['Documents under review', 'active'],
            ['Go live on Rattibha', 'todo']].map(([label, st]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                background: st === 'done' ? C.emerald : st === 'active' ? C.gold100 : C.surface,
                border: st === 'todo' ? `1.5px solid ${C.borderStrong}` : 'none',
                display: 'grid', placeItems: 'center' }}>
                {st === 'done' && <i className="ph-bold ph-check" style={{ fontSize: 14, color: '#fff' }} />}
                {st === 'active' && <i className="ph-fill ph-clock" style={{ fontSize: 14, color: C.gold600 }} />}
              </div>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: st === 'active' ? 600 : 500,
                color: st === 'todo' ? C.fg3 : C.ink }}>{label}</span>
              {st === 'active' && <Badge tone="amber">In review</Badge>}
            </div>
          ))}
        </div>
        <Btn size="lg" icon="ph-arrow-right" onClick={onGoLive} style={{ width: '100%' }}>Preview my dashboard</Btn>
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 12 }}>
          Questions? <b style={{ color: C.brand }}>Contact partner support</b></div>
      </div>
    </div>
  );
}

/* ── wizard shell ────────────────────────────────────────────── */
function OnboardingWizard() {
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const isLast = step === STEPS.length - 1;

  const stepContent = [<StepAccount />, <StepBusiness />, <StepServices />, <StepPortfolio />, <StepVerify />][step];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* brand rail */}
      <div style={{ width: 340, flexShrink: 0, background: 'linear-gradient(160deg,#5B2C83,#2B1440)',
        padding: '40px 34px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '54px', opacity: 0.1, filter: 'brightness(0) invert(1)' }} />
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', bottom: -30, right: -30, width: 220, opacity: 0.16, transform: 'rotate(-8deg)' }} />
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <img src="../../assets/logo-wordmark-light.png" alt="رتّبها" style={{ height: 30, alignSelf: 'flex-start' }} />
          <div style={{ marginTop: 36 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>
              Grow your events business
            </div>
            <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginTop: 12 }}>
              Join hundreds of trusted planners reaching thousands of clients across the Kingdom.
            </p>
          </div>

          {/* step rail */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {STEPS.map((s, i) => {
              const state = done ? 'done' : i < step ? 'done' : i === step ? 'active' : 'todo';
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: 'grid',
                    placeItems: 'center', background: state === 'active' ? '#fff' : state === 'done' ? 'rgba(212,175,55,0.95)' : 'rgba(255,255,255,0.12)',
                    border: state === 'todo' ? '1.5px solid rgba(255,255,255,0.25)' : 'none' }}>
                    {state === 'done'
                      ? <i className="ph-bold ph-check" style={{ fontSize: 16, color: '#3A1B52' }} />
                      : <i className={`${state === 'active' ? 'ph-fill' : 'ph'} ${s.icon}`}
                          style={{ fontSize: 17, color: state === 'active' ? C.brand : 'rgba(255,255,255,0.7)' }} />}
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: state === 'active' ? 600 : 500,
                    color: state === 'todo' ? 'rgba(255,255,255,0.6)' : '#fff' }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
            <i className="ph-fill ph-shield-check" style={{ fontSize: 17, color: C.gold }} />
            Your information is encrypted & secure
          </div>
        </div>
      </div>

      {/* form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#FCFAFE' }}>
        {done ? <PendingState onGoLive={() => { location.href = 'index.html'; }} /> : (
          <>
            {/* progress bar */}
            <div style={{ height: 4, background: C.border }}>
              <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg,#5B2C83,#B6A1D4)', transition: 'width .3s' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px' }}>
              <div style={{ maxWidth: 520, margin: '0 auto' }}>
                <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.brand, marginBottom: 6,
                  letterSpacing: '0.04em' }}>STEP {step + 1} OF {STEPS.length}</div>
                {stepContent}
              </div>
            </div>
            {/* footer nav */}
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 56px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ all: 'unset', cursor: 'pointer',
                fontFamily: SANS, fontSize: 14, fontWeight: 600, color: step === 0 ? C.fg3 : C.ink,
                display: 'inline-flex', alignItems: 'center', gap: 7, opacity: step === 0 ? 0.5 : 1 }}>
                <i className="ph ph-arrow-left" style={{ fontSize: 17 }} />Back
              </button>
              <div style={{ display: 'flex', gap: 7 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999,
                    background: i === step ? C.brand : i < step ? C.lavender : C.border, transition: 'all .25s' }} />
                ))}
              </div>
              <Btn icon={isLast ? 'ph-paper-plane-right' : undefined} iconRight={isLast ? undefined : 'ph-arrow-right'}
                onClick={() => isLast ? setDone(true) : setStep(s => s + 1)}>
                {isLast ? 'Submit application' : 'Continue'}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingWizard });
