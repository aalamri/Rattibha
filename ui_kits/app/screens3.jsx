/* Rattibha app — additional screens (set 3).
   Onboarding, Login, Search + Filters, Notifications, Saved, Booking detail.
   Uses globals from ui.jsx / screens.jsx (C, SANS, DISPLAY, Photo, Badge, Stars, Btn, Avatar, Header, PlannerRow, PLANNERS). */

/* ── Onboarding ─────────────────────────────────────────────── */
function OnboardingScreen({ go }) {
  const slides = [
    { seed: 0, icon: 'ph-magnifying-glass', t: isAR() ? 'اكتشف منظّمين موثوقين' : 'Discover trusted planners',
      d: isAR() ? 'تصفّح أكثر من ٥٠٠ منظّم موثّق في المملكة — حسب الفئة والمدينة والميزانية.' : 'Browse 500+ verified event planners across the Kingdom — by category, city and budget.' },
    { seed: 3, icon: 'ph-chats-circle', t: isAR() ? 'قارن وتواصل مباشرة' : 'Compare & message directly',
      d: isAR() ? 'اقرأ التقييمات، استعرض الباقات، وتحدّث مع المنظّمين قبل أن تلتزم.' : 'Read real reviews, explore packages, and chat with planners before you commit.' },
    { seed: 2, icon: 'ph-calendar-heart', t: isAR() ? 'احجز بثقة' : 'Book with confidence',
      d: isAR() ? 'أمّن موعدك بعربون محمي، ودع الخبراء يتولّون الباقي.' : 'Secure your date with a protected deposit and let the experts handle the rest.' },
  ];
  const [i, setI] = React.useState(0);
  const last = i === slides.length - 1;
  const s = slides[i];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Photo seed={s.seed} style={{ position: 'absolute', inset: 0 }}>
          <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
            style={{ position: 'absolute', top: 40, right: -30, width: 200, height: 'auto', opacity: 0.22,
              transform: 'rotate(-8deg)' }} />
        </Photo>
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <img src="../../assets/logo-wordmark-light.png" alt="رتّبها" style={{ height: 30 }} />
        </div>
        <button onClick={() => go('login')} style={{ position: 'absolute', top: 58, right: 18, all: 'unset',
          cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{isAR() ? 'تخطّي' : 'Skip'}</button>
      </div>

      <div style={{ background: C.cream, borderRadius: '26px 26px 0 0', marginTop: -26, position: 'relative',
        padding: '28px 26px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.rose50, display: 'grid',
          placeItems: 'center', margin: '0 auto 16px' }}>
          <i className={`ph ${s.icon}`} style={{ fontSize: 28, color: C.brand }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 27, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{s.t}</div>
        <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: C.fg2, margin: '10px 0 20px' }}>{s.d}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
          {slides.map((_, k) => (
            <span key={k} style={{ height: 7, width: k === i ? 22 : 7, borderRadius: 999,
              background: k === i ? C.brand : C.borderStrong, transition: 'all .25s' }} />
          ))}
        </div>

        <Btn full size="md" icon={last ? 'ph-arrow-right' : undefined}
          onClick={() => last ? go('login') : setI(i + 1)}>
          {last ? (isAR() ? 'ابدأ الآن' : 'Get started') : (isAR() ? 'التالي' : 'Next')}
        </Btn>
      </div>
    </div>
  );
}

/* ── Login ──────────────────────────────────────────────────── */
function LoginScreen({ go }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, position: 'relative',
      overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, background: C.brand }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '54px', opacity: 0.12, filter: 'brightness(0) invert(1)' }} />
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', top: 30, right: -28, width: 190, height: 'auto', opacity: 0.2,
            transform: 'rotate(-8deg)' }} />
      </div>

      <div style={{ position: 'relative', paddingTop: 92, textAlign: 'center' }}>
        <img src="../../assets/logo-primary-light.png" alt="رتّبها" style={{ height: 96 }} />
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', background: C.cream, borderRadius: '26px 26px 0 0',
        padding: '28px 24px 34px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, textAlign: 'center' }}>
          {isAR() ? 'أهلاً بعودتك' : 'Welcome back'}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2, textAlign: 'center', margin: '6px 0 22px' }}>
          {isAR() ? 'سجّل دخولك لتخطّط احتفالك القادم' : 'Sign in to plan your next celebration'}
        </p>

        <FakeField icon="ph-envelope-simple" label="Email" value="nada@email.com" />
        <div style={{ height: 14 }} />
        <FakeField icon="ph-lock-simple" label="Password" value="••••••••" trailing="ph-eye" />

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <span onClick={() => go('forgot')} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.brand, cursor: 'pointer' }}>{isAR() ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <Btn full icon="ph-arrow-right" onClick={() => go('discover')}>{isAR() ? 'تسجيل الدخول' : 'Sign in'}</Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['ph-apple-logo', 'ph-google-logo'].map(ic => (
            <button key={ic} onClick={() => go('discover')} style={{ all: 'unset', cursor: 'pointer', flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48,
              border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, background: C.surface }}>
              <i className={`ph-fill ${ic}`} style={{ fontSize: 20, color: C.ink }} />
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                {ic.includes('apple') ? 'Apple' : 'Google'}</span>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, fontSize: 13, color: C.fg2 }}>
          {isAR() ? 'جديد هنا؟ ' : 'New here? '}<span onClick={() => go('register')} style={{ color: C.brand, fontWeight: 700, cursor: 'pointer' }}>{isAR() ? 'أنشئ حساباً' : 'Create account'}</span>
        </div>
      </div>
    </div>
  );
}
function FakeField({ icon, label, value, trailing }) {
  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.fg2, marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface,
        border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '13px 14px' }}>
        <i className={`ph ${icon}`} style={{ fontSize: 18, color: C.fg3 }} />
        <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: C.ink }}>{value}</span>
        {trailing && <i className={`ph ${trailing}`} style={{ fontSize: 18, color: C.fg3 }} />}
      </div>
    </div>
  );
}

/* ── Forgot password ────────────────────────────────────────── */
function ForgotPasswordScreen({ go, back }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, position: 'relative',
      overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 230, background: C.brand }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '54px', opacity: 0.12, filter: 'brightness(0) invert(1)' }} />
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', top: 26, right: -28, width: 170, height: 'auto', opacity: 0.2,
            transform: 'rotate(-8deg)' }} />
      </div>

      <div style={{ position: 'relative', padding: '52px 18px 0' }}>
        <button onClick={back} style={{ width: 40, height: 40, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 19, color: '#fff' }} />
        </button>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', marginTop: 18 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: 'rgba(255,255,255,0.16)',
          display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <i className="ph ph-lock-key" style={{ fontSize: 38, color: '#fff' }} />
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', background: C.cream, borderRadius: '26px 26px 0 0',
        padding: '28px 24px 34px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, textAlign: 'center' }}>
          Forgot password?
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2, textAlign: 'center', lineHeight: 1.55,
          margin: '8px auto 22px', maxWidth: 280 }}>
          Enter the email linked to your account and we’ll send a verification code.
        </p>

        <FakeField icon="ph-envelope-simple" label="Email" value="nada@email.com" />

        <div style={{ marginTop: 18 }}>
          <Btn full icon="ph-paper-plane-right" onClick={() => go('otp')}>Send code</Btn>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, fontSize: 13, color: C.fg2 }}>
          Remembered it? <span onClick={() => go('login')} style={{ color: C.brand, fontWeight: 700, cursor: 'pointer' }}>Back to sign in</span>
        </div>
      </div>
    </div>
  );
}

/* ── OTP verification ───────────────────────────────────────── */
function OTPVerificationScreen({ go, back }) {
  const [code, setCode] = React.useState(['4', '8', '', '', '', '']);
  const [secs, setSecs] = React.useState(42);
  React.useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(secs - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const filled = code.filter(Boolean).length;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, position: 'relative',
      overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 230, background: C.brand }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '54px', opacity: 0.12, filter: 'brightness(0) invert(1)' }} />
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', top: 26, right: -28, width: 170, height: 'auto', opacity: 0.2,
            transform: 'rotate(-8deg)' }} />
      </div>

      <div style={{ position: 'relative', padding: '52px 18px 0' }}>
        <button onClick={back} style={{ width: 40, height: 40, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 19, color: '#fff' }} />
        </button>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', marginTop: 18 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: 'rgba(255,255,255,0.16)',
          display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <i className="ph ph-chat-circle-dots" style={{ fontSize: 38, color: '#fff' }} />
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', background: C.cream, borderRadius: '26px 26px 0 0',
        padding: '28px 24px 34px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, textAlign: 'center' }}>
          Verify your email
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2, textAlign: 'center', lineHeight: 1.55,
          margin: '8px auto 24px', maxWidth: 290 }}>
          We sent a 6-digit code to <b style={{ color: C.ink }}>nada@email.com</b>
        </p>

        <div style={{ display: 'flex', gap: 9, justifyContent: 'center' }}>
          {code.map((d, i) => {
            const active = i === filled;
            return (
              <div key={i} style={{ width: 46, height: 56, borderRadius: 13,
                background: d ? C.rose50 : C.surface,
                border: `1.5px solid ${d ? C.brand : active ? C.brand : C.borderStrong}`,
                boxShadow: active ? '0 0 0 3px rgba(75,0,130,0.08)' : 'none',
                display: 'grid', placeItems: 'center', fontFamily: SANS, fontSize: 24, fontWeight: 700,
                color: C.ink }}>
                {d}{active && !d && <span style={{ width: 2, height: 24, background: C.brand,
                  display: 'inline-block', animation: 'none' }} />}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, fontSize: 13, color: C.fg2 }}>
          {secs > 0
            ? <>Resend code in <b style={{ color: C.ink }}>0:{String(secs).padStart(2, '0')}</b></>
            : <span style={{ color: C.brand, fontWeight: 700, cursor: 'pointer' }} onClick={() => setSecs(42)}>Resend code</span>}
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn full icon="ph-check-circle" onClick={() => go('discover')}>Verify &amp; continue</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Register / Sign up ─────────────────────────────────────── */
function RegisterScreen({ go, back }) {
  const [agree, setAgree] = React.useState(true);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, position: 'relative',
      overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 230, background: C.brand }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
          backgroundSize: '54px', opacity: 0.12, filter: 'brightness(0) invert(1)' }} />
        <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', top: 26, right: -28, width: 170, height: 'auto', opacity: 0.2,
            transform: 'rotate(-8deg)' }} />
      </div>

      <div style={{ position: 'relative', padding: '52px 18px 0' }}>
        <button onClick={back} style={{ width: 40, height: 40, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 19, color: '#fff' }} />
        </button>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', marginTop: 6 }}>
        <img src="../../assets/logo-primary-light.png" alt="رتّبها" style={{ height: 72 }} />
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', background: C.cream, borderRadius: '26px 26px 0 0',
        padding: '26px 24px 30px', overflowY: 'auto' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, textAlign: 'center' }}>
          Create your account
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2, textAlign: 'center', margin: '6px 0 22px' }}>
          Join Rattibha and start planning in minutes
        </p>

        <FakeField icon="ph-user" label="Full name" value="Nada Al-Rashid" />
        <div style={{ height: 13 }} />
        <FakeField icon="ph-envelope-simple" label="Email" value="nada@email.com" />
        <div style={{ height: 13 }} />
        <FakeField icon="ph-phone" label="Mobile number" value="+966 50 123 4567" />
        <div style={{ height: 13 }} />
        <FakeField icon="ph-lock-simple" label="Password" value="••••••••" trailing="ph-eye" />

        <div onClick={() => setAgree(a => !a)} style={{ display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 16, cursor: 'pointer' }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0,
            background: agree ? C.brand : C.surface, border: `1.5px solid ${agree ? C.brand : C.borderStrong}`,
            display: 'grid', placeItems: 'center' }}>
            {agree && <i className="ph-bold ph-check" style={{ fontSize: 14, color: '#fff' }} />}
          </div>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2, lineHeight: 1.4 }}>
            I agree to the <span style={{ color: C.brand, fontWeight: 700 }}>Terms</span> &amp;{' '}
            <span style={{ color: C.brand, fontWeight: 700 }}>Privacy Policy</span>
          </span>
        </div>

        <div style={{ marginTop: 18 }}>
          <Btn full icon="ph-arrow-right" onClick={() => go('discover')}>Create account</Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>or sign up with</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['ph-apple-logo', 'ph-google-logo'].map(ic => (
            <button key={ic} onClick={() => go('discover')} style={{ all: 'unset', cursor: 'pointer', flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48,
              border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, background: C.surface }}>
              <i className={`ph-fill ${ic}`} style={{ fontSize: 20, color: C.ink }} />
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                {ic.includes('apple') ? 'Apple' : 'Google'}</span>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, fontSize: 13, color: C.fg2 }}>
          Already have an account? <span onClick={() => go('login')} style={{ color: C.brand, fontWeight: 700, cursor: 'pointer' }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

/* ── Search + Filters ───────────────────────────────────────── */
function SearchScreen({ go, back }) {
  const [q, setQ] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);
  const recent = ['Wedding planners', 'Outdoor venues', 'Birthday décor'];
  const results = q ? PLANNERS.filter(p => (p.name + p.type + p.city).toLowerCase().includes(q.toLowerCase())) : PLANNERS;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, position: 'relative' }}>
      <div style={{ padding: '52px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={back} style={{ width: 38, height: 38, borderRadius: 999, border: `1.5px solid ${C.border}`,
          background: C.surface, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18, color: C.ink }} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: C.surface,
          border: `1.5px solid ${C.brand}`, borderRadius: 14, padding: '11px 13px',
          boxShadow: '0 0 0 3px rgba(75,0,130,0.08)' }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: C.brand }} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search planners, venues…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS,
              fontSize: 14, color: C.ink }} />
          {q && <i className="ph-fill ph-x-circle" onClick={() => setQ('')} style={{ fontSize: 17, color: C.fg3, cursor: 'pointer' }} />}
        </div>
        <button onClick={() => setShowFilter(true)} style={{ width: 44, height: 44, borderRadius: 13, border: 'none',
          background: C.brand, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <i className="ph ph-sliders-horizontal" style={{ fontSize: 19, color: '#fff' }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 20px' }}>
        {!q && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.fg2, marginBottom: 10 }}>RECENT</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recent.map(r => (
                <button key={r} onClick={() => setQ(r)} style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 13, color: C.ink, background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 999, padding: '8px 13px' }}>
                  <i className="ph ph-clock-counter-clockwise" style={{ fontSize: 14, color: C.fg3 }} />{r}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink }}>
            {q ? `Results for “${q}”` : 'All planners'}</span>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{results.length} found</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {results.map(p => <PlannerRow key={p.id} p={p} onOpen={pp => go('planner', pp)} />)}
          {results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.fg3, fontFamily: SANS, fontSize: 14 }}>
              <i className="ph ph-magnifying-glass" style={{ fontSize: 34, display: 'block', marginBottom: 10 }} />
              No planners match your search.
            </div>
          )}
        </div>
      </div>

      {showFilter && <FilterSheet onClose={() => setShowFilter(false)} />}
    </div>
  );
}

function FilterSheet({ onClose }) {
  const [evt, setEvt] = React.useState('Wedding');
  const [sort, setSort] = React.useState('Top rated');
  const [budget, setBudget] = React.useState(30000);
  const [city, setCity] = React.useState('Riyadh');
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(43,34,51,0.45)' }} />
      <div style={{ position: 'relative', background: C.cream, borderRadius: '24px 24px 0 0', padding: '14px 22px 30px',
        boxShadow: '0 -18px 44px -16px rgba(43,34,51,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.borderStrong, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 600, color: C.ink }}>Filters</span>
          <span onClick={onClose} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand, cursor: 'pointer' }}>Reset</span>
        </div>

        <FilterGroup label="City">
          {['All Saudi Arabia', 'Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar'].map(t => (
            <Pill key={t} on={city === t} onClick={() => setCity(t)}>{t}</Pill>
          ))}
        </FilterGroup>
        <FilterGroup label="Event type">
          {['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Gala'].map(t => (
            <Pill key={t} on={evt === t} onClick={() => setEvt(t)}>{t}</Pill>
          ))}
        </FilterGroup>
        <FilterGroup label={`Budget · up to SAR ${budget.toLocaleString()}`}>
          <input type="range" min="2000" max="60000" step="1000" value={budget}
            onChange={e => setBudget(+e.target.value)} style={{ width: '100%', accentColor: C.brand }} />
        </FilterGroup>
        <FilterGroup label="Sort by">
          {['Top rated', 'Price: low', 'Most booked'].map(t => (
            <Pill key={t} on={sort === t} onClick={() => setSort(t)}>{t}</Pill>
          ))}
        </FilterGroup>

        <div style={{ marginTop: 22 }}>
          <Btn full onClick={onClose}>Show results</Btn>
        </div>
      </div>
    </div>
  );
}
function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}
function Pill({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer', fontFamily: SANS, fontSize: 13,
      fontWeight: 600, padding: '8px 14px', borderRadius: 999,
      border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
      color: on ? C.brand : C.ink }}>{children}</button>
  );
}

/* ── Notifications ──────────────────────────────────────────── */
function NotificationsScreen({ go, back }) {
  const groups = [
    { when: 'Today', items: [
      { icon: 'ph-chat-circle-dots', tint: C.rose50, color: C.brand, t: 'Lumière Events replied',
        d: '“We’ll send the moodboard tomorrow ✨”', time: '2m', unread: true },
      { icon: 'ph-seal-check', tint: C.emerald100, color: C.emerald, t: 'Booking confirmed',
        d: 'Your Signature Wedding deposit was received.', time: '1h', unread: true },
    ]},
    { when: 'Earlier', items: [
      { icon: 'ph-tag', tint: '#F6E7C4', color: '#B5881A', t: 'Limited offer',
        d: 'Orbit Corporate added a 10% seasonal discount.', time: 'Yesterday' },
      { icon: 'ph-star', tint: C.lavender100, color: C.lavender, t: 'Leave a review',
        d: 'How was your event with Zahra Parties?', time: '2d', action: 'review' },
    ]},
  ];
  return (
    <div style={{ paddingBottom: 30 }}>
      <Header title="Notifications" onBack={back} right={
        <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.brand, cursor: 'pointer' }}>Mark all read</span>
      } />
      <div style={{ padding: '0 18px' }}>
        {groups.map(g => (
          <div key={g.when} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.fg3, margin: '0 0 10px 2px',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.when}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.items.map((n, i) => (
                <div key={i} onClick={() => n.action && go(n.action, { p: PLANNERS[3] })} style={{ display: 'flex', gap: 12, background: n.unread ? C.rose50 : C.surface,
                  border: `1px solid ${n.unread ? C.rose100 : C.border}`, borderRadius: 16, padding: 13,
                  cursor: n.action ? 'pointer' : 'default' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: n.tint, display: 'grid',
                    placeItems: 'center', flexShrink: 0 }}>
                    <i className={`ph-fill ${n.icon}`} style={{ fontSize: 20, color: n.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>{n.t}</span>
                      <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3, flexShrink: 0 }}>{n.time}</span>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.45, color: C.fg2, margin: '3px 0 0' }}>{n.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Saved planners ─────────────────────────────────────────── */
function SavedScreen({ go, back }) {
  const saved = [PLANNERS[0], PLANNERS[1], PLANNERS[3]];
  if (saved.length === 0) {
    return (
      <div style={{ paddingBottom: 30 }}>
        <Header title="Saved planners" onBack={back} />
        <EmptyState icon="ph-heart" title="No saved planners yet"
          body="Tap the heart on any planner to save them here for later."
          cta="Discover planners" onCta={() => go('discover')} />
      </div>
    );
  }
  return (
    <div style={{ paddingBottom: 30 }}>
      <Header title="Saved planners" sub={`${saved.length} saved`} onBack={back} />
      <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
        {saved.map(p => (
          <button key={p.id} onClick={() => go('planner', p)} style={{ all: 'unset', cursor: 'pointer' }}>
            <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`,
              boxShadow: '0 8px 20px -14px rgba(43,34,51,0.18)', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <Photo seed={p.seed} style={{ height: 104 }} />
                <div style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 999,
                  background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center' }}>
                  <i className="ph-fill ph-heart" style={{ fontSize: 16, color: C.brand }} />
                </div>
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg2 }}>{p.city}</span>
                  <Stars rating={p.rating} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Booking detail ─────────────────────────────────────────── */
function BookingDetailScreen({ data, go, back }) {
  const { p, pkg = 'Signature Wedding', date = '14 Mar 2026', price = 18000, status = 'Confirmed' } = data;
  const deposit = Math.round(price * 0.2);
  const timeline = isAR() ? [
    { t: 'تأكّد الحجز', d: 'تم استلام العربون', done: true, icon: 'ph-check' },
    { t: 'التخطيط والتصميم', d: 'لوحة الإلهام + اختيار القاعة', done: true, icon: 'ph-palette' },
    { t: 'المعاينة النهائية', d: 'قبل أسبوع من الموعد', done: false, icon: 'ph-clipboard-text' },
    { t: 'يوم المناسبة', d: date, done: false, icon: 'ph-confetti' },
  ] : [
    { t: 'Booking confirmed', d: 'Deposit received', done: true, icon: 'ph-check' },
    { t: 'Planning & design', d: 'Moodboard + venue selection', done: true, icon: 'ph-palette' },
    { t: 'Final walkthrough', d: 'Due 1 week before', done: false, icon: 'ph-clipboard-text' },
    { t: 'Event day', d: date, done: false, icon: 'ph-confetti' },
  ];
  return (
    <div style={{ paddingBottom: 30 }}>
      <Header title="Booking details" onBack={back} />
      <div style={{ padding: '0 18px' }}>
        {/* planner summary */}
        <div style={{ display: 'flex', gap: 13, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 18, padding: 13, boxShadow: '0 8px 20px -14px rgba(43,34,51,0.18)' }}>
          <Photo seed={p.seed} style={{ width: 64, height: 64, borderRadius: 13, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink }}>{trPlanner(p, 'name')}</span>
              <Badge bg={C.emerald100} fg={C.emerald} icon="ph-fill ph-seal-check">{tr(status)}</Badge>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2, marginTop: 2 }}>{pkg}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 12.5,
              color: C.fg3, marginTop: 6 }}>
              <i className="ph ph-calendar-blank" style={{ fontSize: 14 }} />{date} · {trCity(p.city)}
            </div>
          </div>
        </div>

        {/* timeline */}
        <SectionLabel>{tr('Event timeline')}</SectionLabel>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '16px 16px 6px' }}>
          {timeline.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, paddingBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                  background: s.done ? C.brand : C.surface, border: `1.5px solid ${s.done ? C.brand : C.borderStrong}`,
                  display: 'grid', placeItems: 'center' }}>
                  <i className={`ph ${s.done ? 'ph-check' : s.icon}`} style={{ fontSize: 15,
                    color: s.done ? '#fff' : C.fg3 }} />
                </div>
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 22,
                  background: s.done ? C.brand : C.border, marginTop: 2 }} />}
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700,
                  color: s.done ? C.ink : C.fg2 }}>{s.t}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* payment */}
        <SectionLabel>{tr('Payment')}</SectionLabel>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16 }}>
          <PayRow label={isAR() ? 'العربون (٢٠٪)' : 'Deposit (20%)'} value={`SAR ${deposit.toLocaleString()}`} tag={isAR() ? 'مدفوع' : 'Paid'} tagColor={C.emerald} tagBg={C.emerald100} />
          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
          <PayRow label={isAR() ? 'المتبقّي' : 'Balance'} value={`SAR ${(price - deposit).toLocaleString()}`} tag={isAR() ? 'مستحق قبل المناسبة' : 'Due before event'} tagColor="#8a5d14" tagBg="#F7E8C9" />
          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{isAR() ? 'الإجمالي' : 'Total'}</span>
            <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: C.brand }}>SAR {price.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <Btn variant="secondary" icon="ph-star" onClick={() => go('review', { p })} style={{ flex: 1 }}>{isAR() ? 'تقييم' : 'Review'}</Btn>
          <Btn icon="ph-credit-card" onClick={() => go('chat', p)} style={{ flex: 1 }}>{isAR() ? 'دفع المتبقّي' : 'Pay balance'}</Btn>
        </div>
      </div>
    </div>
  );
}
function SectionLabel({ children }) {
  return <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink, margin: '20px 0 11px' }}>{children}</div>;
}
function PayRow({ label, value, tag, tagColor, tagBg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{label}</div>
        {tag && <span style={{ display: 'inline-block', marginTop: 4, fontFamily: SANS, fontSize: 10.5, fontWeight: 700,
          color: tagColor, background: tagBg, padding: '2px 8px', borderRadius: 999 }}>{tag}</span>}
      </div>
      <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>{value}</span>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, LoginScreen, RegisterScreen, ForgotPasswordScreen, OTPVerificationScreen,
  SearchScreen, FilterSheet, NotificationsScreen, SavedScreen, BookingDetailScreen });
