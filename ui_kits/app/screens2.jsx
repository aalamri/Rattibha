/* Rattibha app — booking, confirmation, messages, bottom nav. Uses globals. */

function BookingScreen({ data, go, back }) {
  const { p, pkg } = data;
  const chosen = p.packages[pkg];
  const [evType, setEvType] = React.useState(p.type.split(' ')[0]);
  const [guests, setGuests] = React.useState(150);
  const deposit = Math.round(chosen.price * 0.2);
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Book event" sub={p.name} onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Event type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Wedding','Engagement','Birthday','Corporate','Gala'].map(t => {
              const on = evType === t;
              return <button key={t} onClick={() => setEvType(t)} style={{ all: 'unset', cursor: 'pointer',
                fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 13px', borderRadius: 999,
                border: `1.5px solid ${on ? '#7E3FAE' : C.borderStrong}`, background: on ? C.rose50 : C.surface,
                color: on ? C.rose700 : C.ink }}>{t}</button>;
            })}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Date" style={{ flex: 1 }}>
            <InputBox icon="ph-calendar-blank" value="14 Mar 2026" />
          </Field>
          <Field label="City" style={{ flex: 1 }}>
            <InputBox icon="ph-map-pin" value={p.city} />
          </Field>
        </div>

        <Field label={`Guests · ${guests}`}>
          <input type="range" min="20" max="600" value={guests} onChange={e => setGuests(+e.target.value)}
            style={{ width: '100%', accentColor: C.brand }} />
        </Field>

        {/* package summary */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16,
          boxShadow: '0 8px 20px -14px rgba(43,34,51,0.18)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Photo seed={p.seed} style={{ width: 54, height: 54, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, color: C.ink, fontSize: 14.5 }}>{chosen.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{chosen.note}</div>
            </div>
          </div>
          <div style={{ height: 1, background: C.border, margin: '13px 0' }} />
          <Line label="Package total" value={`SAR ${chosen.price.toLocaleString()}`} />
          <Line label="Deposit (20%) due today" value={`SAR ${deposit.toLocaleString()}`} strong />
          <Line label="Balance before event" value={`SAR ${(chosen.price - deposit).toLocaleString()}`} muted />
        </div>
      </div>
    </div>
  );
}

function BookingFooter({ data, go }) {
  const chosen = data.p.packages[data.pkg];
  const deposit = Math.round(chosen.price * 0.2);
  return (
    <div style={{ padding: '12px 18px 30px',
      background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-fill ph-lock-simple" onClick={() => go('checkout', data)}>
        Continue to payment
      </Btn>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.fg2, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
function InputBox({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface,
      border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '12px 13px' }}>
      <i className={`ph ${icon}`} style={{ fontSize: 17, color: C.fg3 }} />
      <span style={{ fontFamily: SANS, fontSize: 14, color: C.ink }}>{value}</span>
    </div>
  );
}
function Line({ label, value, strong, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontFamily: SANS, fontSize: 13.5, color: muted ? C.fg3 : C.fg2 }}>{label}</span>
      <span style={{ fontFamily: SANS, fontSize: strong ? 16 : 14, fontWeight: strong ? 800 : 600,
        color: strong ? C.brand : C.ink }}>{value}</span>
    </div>
  );
}

function ConfirmScreen({ data, go }) {
  const { p, pkg } = data;
  const chosen = p.packages[pkg];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../assets/pattern.svg)',
        backgroundSize: '58px', opacity: 0.5, pointerEvents: 'none',
        WebkitMaskImage: 'radial-gradient(circle at 50% 38%, #000, transparent 70%)',
        maskImage: 'radial-gradient(circle at 50% 38%, #000, transparent 70%)' }} />
      <img src="../../assets/glyph-ra.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', top: '6%', left: '50%', width: 250, height: 'auto', opacity: 0.12,
          transform: 'translateX(-50%) rotate(-6deg)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 96, height: 96, marginBottom: 20, position: 'relative', display: 'grid', placeItems: 'center' }}>
        <img src="../../assets/logo-primary.png" width="96" height="96" alt="" style={{ objectFit: 'contain' }} />
        <div style={{ position: 'absolute', right: 2, bottom: 2, width: 34, height: 34, borderRadius: 999,
          background: C.emerald, display: 'grid', placeItems: 'center', border: '3px solid #FAF7F2' }}>
          <i className="ph-fill ph-check" style={{ fontSize: 18, color: '#fff' }} />
        </div>
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 600, color: C.ink, lineHeight: 1.05 }}>
        {isAR() ? 'تم الحجز!' : "You're booked!"}
      </div>
      <p style={{ fontFamily: SANS, fontSize: 14.5, color: C.fg2, lineHeight: 1.55, margin: '10px 0 22px' }}>
        {isAR()
          ? <>تم دفع العربون وتم إشعار <b style={{ color: C.ink }}>{trPlanner(p, 'name')}</b>. سيؤكّدون التفاصيل خلال ٢٤ ساعة.</>
          : <>Your deposit is paid and <b style={{ color: C.ink }}>{p.name}</b> has been notified. They'll confirm details within 24 hours.</>}
      </p>
      <div style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18,
        padding: 16, textAlign: isAR() ? 'right' : 'left' }}>
        <Line label={isAR() ? 'المنظّم' : 'Planner'} value={trPlanner(p, 'name')} />
        <Line label={isAR() ? 'الباقة' : 'Package'} value={chosen.name} />
        <Line label={isAR() ? 'التاريخ' : 'Date'} value={isAR() ? '١٤ مارس ٢٠٢٦' : '14 Mar 2026'} />
        <Line label={isAR() ? 'الحالة' : 'Status'} value={tr('Confirmed')} strong />
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 20 }}>
        <Btn variant="secondary" icon="ph-chat-circle" onClick={() => go('messages')} style={{ flex: 1 }}>{tr('Message')}</Btn>
        <Btn icon="ph-house" onClick={() => go('discover')} style={{ flex: 1 }}>{isAR() ? 'تم' : 'Done'}</Btn>
      </div>
      </div>
    </div>
  );
}

function MessagesScreen({ go }) {
  const convos = [
    { p: PLANNERS[0], last: 'Wonderful! We\u2019ll send the moodboard tomorrow ✨', time: '2m', unread: 2, online: true },
    { p: PLANNERS[2], last: 'The stage layout is confirmed for the launch.', time: '1h', unread: 0 },
    { p: PLANNERS[1], last: 'Thank you! Looking forward to your engagement 💍', time: '3h', unread: 0 },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="Messages" />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        {convos.map((c, i) => (
          <button key={i} onClick={() => go('chat', c.p)} style={{ all: 'unset', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '13px 0',
              borderBottom: i < convos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ position: 'relative' }}>
                <Avatar seed={c.p.seed} size={50} initials={c.p.name[0]} />
                {c.online && <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12,
                  borderRadius: 999, background: C.emerald, border: '2.5px solid #FBF5EF' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: C.ink }}>{c.p.name}</span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{c.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: c.unread ? C.ink : C.fg2,
                    fontWeight: c.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' }}>{c.last}</span>
                  {c.unread > 0 && <span style={{ background: C.brand, color: '#fff', fontFamily: SANS,
                    fontSize: 11, fontWeight: 800, minWidth: 19, height: 19, borderRadius: 999, display: 'grid',
                    placeItems: 'center', padding: '0 5px', flexShrink: 0 }}>{c.unread}</span>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ p, back }) {
  const msgs = [
    { me: false, t: 'Hello! Thank you for booking Lumière. So excited to plan your celebration 🎉' },
    { me: true, t: 'Hi! We\u2019re thrilled. Can we do a garden theme in soft rose & gold?' },
    { me: false, t: 'Absolutely — that\u2019s one of our signature palettes. It will look stunning.' },
    { me: false, t: 'We\u2019ll send the moodboard tomorrow ✨' },
    { me: true, t: 'Perfect, can\u2019t wait!' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 18px 12px',
        borderBottom: `1px solid ${C.border}` }}>
        <button onClick={back} style={{ width: 38, height: 38, borderRadius: 999, border: `1.5px solid ${C.border}`,
          background: C.surface, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18, color: C.ink }} />
        </button>
        <Avatar seed={p.seed} size={40} initials={p.name[0]} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: C.ink }}>{p.name}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: C.emerald }}>● Online</div>
        </div>
        <i className="ph ph-phone" style={{ fontSize: 20, color: C.brand }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '78%',
            background: m.me ? C.brand : C.surface, color: m.me ? '#FBF7FF' : C.ink,
            border: m.me ? 'none' : `1px solid ${C.border}`, borderRadius: m.me ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
            padding: '10px 14px', fontFamily: SANS, fontSize: 14, lineHeight: 1.45,
            boxShadow: '0 4px 12px -8px rgba(43,34,51,0.2)' }}>{m.t}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 18px 30px',
        borderTop: `1px solid ${C.border}` }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: C.surface,
          border: `1.5px solid ${C.borderStrong}`, borderRadius: 999, padding: '11px 16px' }}>
          <span style={{ fontFamily: SANS, fontSize: 14, color: C.fg3, flex: 1 }}>Message…</span>
          <i className="ph ph-paperclip" style={{ fontSize: 18, color: C.fg3 }} />
        </div>
        <button style={{ width: 46, height: 46, borderRadius: 999, border: 'none', background: C.brand,
          display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 8px 18px -8px rgba(75,0,130,0.6)' }}>
          <i className="ph-fill ph-paper-plane-right" style={{ fontSize: 20, color: '#fff' }} />
        </button>
      </div>
    </div>
  );
}

function BottomNav({ tab, go }) {
  const tabs = [
    { key: 'discover', label: 'Discover', icon: 'ph-compass' },
    { key: 'requests', label: 'Requests', icon: 'ph-megaphone' },
    { key: 'bookings', label: 'Bookings', icon: 'ph-calendar-check' },
    { key: 'messages', label: 'Messages', icon: 'ph-chat-circle' },
    { key: 'profile', label: 'Profile', icon: 'ph-user' },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, paddingBottom: 22,
      paddingTop: 8, background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(14px)',
      borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-around' }}>
      {tabs.map(t => {
        const on = tab === t.key;
        return (
          <button key={t.key} onClick={() => go(t.key)} style={{ all: 'unset', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            <i className={`${on ? 'ph-fill' : 'ph'} ${t.icon}`} style={{ fontSize: 23,
              color: on ? C.brand : C.fg3 }} />
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: on ? 700 : 600,
              color: on ? C.brand : C.fg3 }}>{tr(t.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { BookingScreen, BookingFooter, ConfirmScreen, MessagesScreen, ChatScreen, BottomNav });
