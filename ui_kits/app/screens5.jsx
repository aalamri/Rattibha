/* Rattibha app — deal lifecycle (set 5): Request → Offer → Contract.
   Flow: Planner → Request (compose) → Request sent → Offer (both agree) → Sign contract → Checkout → Confirm.
   Uses globals (C, SANS, DISPLAY, Btn, Photo, Badge, Avatar, Header, Field, InputBox, Line). */

/* ── Request to book ────────────────────────────────────────── */
function RequestScreen({ data, go, back }) {
  const { p, pkg = 0 } = data;
  const chosen = p.packages[pkg];
  const [evType, setEvType] = React.useState(p.type.split(' ')[0].replace('&', 'Wedding'));
  const [guests, setGuests] = React.useState(150);
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Request to book" sub={p.name} onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.rose50, borderRadius: 14,
          padding: '12px 14px' }}>
          <i className="ph-fill ph-paper-plane-tilt" style={{ fontSize: 19, color: C.brand }} />
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.brand, lineHeight: 1.45 }}>
            Send your event details — {p.name.split(' ')[0]} will reply with a tailored offer. No payment yet.</span>
        </div>

        <Field label="Event type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Wedding','Engagement','Birthday','Corporate','Gala'].map(t => {
              const on = evType === t;
              return <button key={t} onClick={() => setEvType(t)} style={{ all: 'unset', cursor: 'pointer',
                fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 13px', borderRadius: 999,
                border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
                color: on ? C.brand : C.ink }}>{t}</button>;
            })}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Preferred date" style={{ flex: 1 }}><InputBox icon="ph-calendar-blank" value="14 Mar 2026" /></Field>
          <Field label="City" style={{ flex: 1 }}><InputBox icon="ph-map-pin" value={p.city} /></Field>
        </div>

        <Field label={`Guests · ${guests}`}>
          <input type="range" min="20" max="600" value={guests} onChange={e => setGuests(+e.target.value)}
            style={{ width: '100%', accentColor: C.brand }} />
        </Field>

        <Field label="Budget range">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['< 10k','10–20k','20–35k','35k+'].map((t, i) => {
              const on = i === 1;
              return <span key={t} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 13px',
                borderRadius: 999, border: `1.5px solid ${on ? C.brand : C.borderStrong}`,
                background: on ? C.rose50 : C.surface, color: on ? C.brand : C.ink }}>SAR {t}</span>;
            })}
          </div>
        </Field>

        <Field label="Message to planner">
          <div style={{ border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '12px 14px',
            background: C.surface, fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.5, minHeight: 80 }}>
            We'd love an elegant garden wedding in soft rose & gold. Interested in your {chosen.name} package — can you tailor it for {guests} guests?
          </div>
        </Field>
      </div>
    </div>
  );
}
function RequestFooter({ data, go }) {
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-paper-plane-right" onClick={() => go('requestSent', data)}>Send request</Btn>
    </div>
  );
}

/* ── Request sent (awaiting offer) ──────────────────────────── */
function RequestSentScreen({ data, go }) {
  const { p, broadcast } = data;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <img src="../../assets/glyph-ra.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', top: '10%', left: '50%', width: 240, opacity: 0.06,
          transform: 'translateX(-50%) rotate(-6deg)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: 26, background: C.rose50, display: 'grid',
          placeItems: 'center', marginBottom: 20, position: 'relative' }}>
          <i className="ph-fill ph-paper-plane-tilt" style={{ fontSize: 42, color: C.brand }} />
          <div style={{ position: 'absolute', right: -4, bottom: -4, width: 32, height: 32, borderRadius: 999,
            background: C.gold, display: 'grid', placeItems: 'center', border: '3px solid #FAF7F2' }}>
            <i className="ph-fill ph-clock" style={{ fontSize: 16, color: C.ink }} />
          </div>
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
          {broadcast ? 'Request posted!' : 'Request sent!'}</div>
        <p style={{ fontFamily: SANS, fontSize: 14.5, color: C.fg2, lineHeight: 1.6, margin: '10px 0 22px' }}>
          {broadcast
            ? <>Verified planners are reviewing your event now. You’ll start receiving <b style={{ color: C.ink }}>tailored quotes</b> within a few hours — compare and choose the one you love.</>
            : <><b style={{ color: C.ink }}>{p.name}</b> usually replies within a few hours with a tailored offer. We'll notify you the moment it arrives.</>}
        </p>
        {/* status steps */}
        <div style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: 16, textAlign: 'left', marginBottom: 22 }}>
          {(broadcast
            ? [['Request posted', 'done'], ['Planners quoting', 'active'], ['Compare offers', 'todo'], ['Pick & sign', 'todo']]
            : [['Request sent', 'done'], ['Planner reviewing', 'active'], ['Offer & agreement', 'todo'], ['Sign & pay deposit', 'todo']]
          ).map(([l, st]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '5px 0' }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                background: st === 'done' ? C.emerald : st === 'active' ? '#F6E7C4' : C.surface,
                border: st === 'todo' ? `1.5px solid ${C.borderStrong}` : 'none', display: 'grid', placeItems: 'center' }}>
                {st === 'done' && <i className="ph-bold ph-check" style={{ fontSize: 13, color: '#fff' }} />}
                {st === 'active' && <i className="ph-fill ph-clock" style={{ fontSize: 13, color: '#B5881A' }} />}
              </div>
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: st === 'active' ? 700 : 500,
                color: st === 'todo' ? C.fg3 : C.ink }}>{l}</span>
            </div>
          ))}
        </div>
        <Btn full icon={broadcast ? 'ph-stack' : 'ph-eye'} onClick={() => go(broadcast ? 'proposals' : 'offer', data)}>
          {broadcast ? 'View offers (demo)' : 'View offer (demo)'}</Btn>
        <button onClick={() => go('discover')} style={{ all: 'unset', cursor: 'pointer', marginTop: 14,
          fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.fg2 }}>Back to browsing</button>
      </div>
    </div>
  );
}

/* ── Offer received (both agree) ────────────────────────────── */
function OfferScreen({ data, go, back }) {
  const { p, pkg = 0 } = data;
  const chosen = p.packages[pkg];
  const deposit = Math.round(chosen.price * 0.2);
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Offer from planner" sub={p.name} onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* planner message */}
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <Avatar seed={p.seed} size={40} initials={p.name[0]} />
          <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: '4px 16px 16px 16px',
            padding: '12px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.5, color: C.ink }}>
              {isAR() ? 'أهلاً ندا! يسعدنا تنظيم زفافك 💜 إليك عرضاً مخصّصاً لـ ١٥٠ ضيف بألوان الوردي والذهبي.' : "Hi Nada! We'd be delighted to plan your wedding 💜 Here's a tailored offer for 150 guests in rose & gold."}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: C.fg3, marginTop: 6 }}>{trPlanner(p, 'name')} · {isAR() ? 'الآن' : 'just now'}</div>
          </div>
        </div>

        {/* the offer card */}
        <div style={{ background: C.surface, border: `1.5px solid ${C.brand}`, borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 12px 28px -16px rgba(91,44,131,0.4)' }}>
          <div style={{ background: 'linear-gradient(135deg,#5B2C83,#3A1B52)', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
              style={{ position: 'absolute', right: -14, bottom: -18, width: 92, opacity: 0.18 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.8)' }}>{tr('Custom offer')}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, color: '#fff' }}>{chosen.name}</div>
            </div>
            <Badge bg={C.gold200} fg="#7a5e15" icon="ph-fill ph-seal-check">{tr('Valid 7 days')}</Badge>
          </div>
          <div style={{ padding: 16 }}>
            {(isAR()
              ? ['التخطيط والتنسيق الكامل','تنسيق القاعة — وردي وذهبي','ضيافة لـ ١٥٠ ضيف','تنسيق زهور وتصوير']
              : ['Full planning & coordination','Venue styling — rose & gold','Catering for 150 guests','Live florals & photography']
            ).map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0' }}>
                <i className="ph-fill ph-check-circle" style={{ fontSize: 18, color: C.emerald }} />
                <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.ink }}>{t}</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
            <Line label={tr('Total price')} value={`SAR ${chosen.price.toLocaleString()}`} strong />
            <Line label={isAR() ? 'العربون للتأكيد (٢٠٪)' : 'Deposit to confirm (20%)'} value={`SAR ${deposit.toLocaleString()}`} />
            <Line label={isAR() ? 'المتبقّي قبل المناسبة' : 'Balance before event'} value={`SAR ${(chosen.price - deposit).toLocaleString()}`} muted />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12, color: C.fg3 }}>
          <i className="ph ph-info" style={{ fontSize: 16 }} />
          {isAR() ? 'القبول ينقلك إلى اتفاقية موقّعة — لا تدفع إلا بعد التوقيع.' : 'Accepting moves you to a signed agreement — you only pay after signing.'}
        </div>
      </div>
    </div>
  );
}
function OfferFooter({ data, go }) {
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)',
      display: 'flex', gap: 12 }}>
      <Btn variant="secondary" icon="ph-chat-circle" onClick={() => go('chat', data.p)} style={{ flex: 1 }}>{tr('Negotiate')}</Btn>
      <Btn icon="ph-check" onClick={() => go('contract', data)} style={{ flex: 1.5 }}>{tr('Accept offer')}</Btn>
    </div>
  );
}

/* ── Sign contract ──────────────────────────────────────────── */
function ContractScreen({ data, go, back }) {
  const { p, pkg = 0 } = data;
  const chosen = p.packages[pkg];
  const deposit = Math.round(chosen.price * 0.2);
  const [signed, setSigned] = React.useState(false);
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Service agreement" sub={p.name} onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* document */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18,
          boxShadow: '0 8px 20px -14px rgba(43,34,51,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.rose50, display: 'grid', placeItems: 'center' }}>
              <i className="ph-fill ph-file-text" style={{ fontSize: 20, color: C.brand }} />
            </div>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>{isAR() ? 'اتفاقية خدمات المناسبات' : 'Event Services Agreement'}</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{isAR() ? 'رقم RTB-2026-0314 · الرياض، السعودية' : 'Ref RTB-2026-0314 · Riyadh, KSA'}</div>
            </div>
          </div>
          <CRow label={isAR() ? 'العميل' : 'Client'} value="Nada Al-Rashid" />
          <CRow label={isAR() ? 'المنظّم' : 'Planner'} value={trPlanner(p, 'name')} />
          <CRow label={isAR() ? 'المناسبة' : 'Event'} value={isAR() ? 'زفاف · ١٤ مارس ٢٠٢٦ · ١٥٠ ضيف' : 'Wedding · 14 Mar 2026 · 150 guests'} />
          <CRow label={isAR() ? 'الباقة' : 'Package'} value={chosen.name} />
          <CRow label={isAR() ? 'الرسوم الإجمالية' : 'Total fee'} value={`SAR ${chosen.price.toLocaleString()}`} />
          <CRow label={isAR() ? 'العربون عند التوقيع' : 'Deposit on signing'} value={`SAR ${deposit.toLocaleString()}`} />
          <CRow label={isAR() ? 'الإلغاء' : 'Cancellation'} value={isAR() ? 'مجانًا حتى ٣٠ يومًا قبل' : 'Free up to 30 days before'} last />
        </div>

        {/* terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(isAR()
            ? ['أوافق على النطاق والتسعير أعلاه','أقبل سياسة الإلغاء والاسترداد','يُحفظ العربون بأمان حتى المناسبة']
            : ['I agree to the scope and pricing above','I accept the cancellation & refund policy','Deposit is held securely until the event']
          ).map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="ph-fill ph-check-circle" style={{ fontSize: 19, color: C.emerald }} />
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* signature */}
        <Field label={isAR() ? 'توقيعك' : 'Your signature'}>
          <button onClick={() => setSigned(s => !s)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
            <div style={{ height: 92, borderRadius: 14, border: `1.5px ${signed ? 'solid' : 'dashed'} ${signed ? C.brand : C.borderStrong}`,
              background: signed ? C.rose50 : C.surface, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4 }}>
              {signed
                ? <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 30,
                    fontWeight: 600, color: C.brand }}>Nada Al-Rashid</span>
                : <><i className="ph ph-signature" style={{ fontSize: 26, color: C.fg3 }} />
                    <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{isAR() ? 'انقر للتوقيع' : 'Tap to sign'}</span></>}
            </div>
          </button>
        </Field>
      </div>
    </div>
  );
}
function CRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '7px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
      <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{label}</span>
      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function ContractFooter({ data, go }) {
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-fill ph-pen-nib" onClick={() => go('checkout', data)}>{tr('Sign & pay deposit')}</Btn>
    </div>
  );
}

Object.assign(window, { RequestScreen, RequestFooter, RequestSentScreen,
  OfferScreen, OfferFooter, ContractScreen, ContractFooter });
