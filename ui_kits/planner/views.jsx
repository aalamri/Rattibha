/* Rattibha Planner Dashboard — Bookings table + Calendar + Earnings + Messages + Profile. */

/* ── Bookings ─────────────────────────────────────────────────── */
function BookingsView({ go }) {
  const statusTone = { confirmed: 'green', pending: 'amber' };
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {[['Confirmed', BOOKINGS.filter(b => b.status === 'confirmed').length, 'green'],
          ['Pending', BOOKINGS.filter(b => b.status === 'pending').length, 'amber'],
          ['Total value', 'SAR 84,800', 'purple']].map(([l, v, tone]) => (
          <Card key={l} pad={16} style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr(l)}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: C.ink, marginTop: 4 }}>{v}</div>
          </Card>
        ))}
      </div>

      <Card pad={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1fr 40px',
          padding: '14px 22px', borderBottom: `1px solid ${C.border}`, fontFamily: SANS, fontSize: 12,
          fontWeight: 600, color: C.fg3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span>{tr('Client')}</span><span>{tr('Package')}</span><span>{tr('Date')}</span><span>{tr('Payment')}</span><span>{tr('Status')}</span><span></span>
        </div>
        {BOOKINGS.map(b => (
          <div key={b.id} onClick={() => go && go('bookingDetail', b)} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1fr 40px',
            padding: '14px 22px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Avatar seed={b.seed} size={38} initials={b.initials} />
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{b.client}</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{b.stage}</div>
              </div>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{b.pkg}</span>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{trDate(b.date)}</span>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>SAR {b.value.toLocaleString()}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: b.paid ? C.emerald : C.amber }}>
                {b.paid ? `SAR ${b.paid.toLocaleString()} ${tr('paid')}` : tr('Awaiting deposit')}</div>
            </div>
            <span><Badge tone={statusTone[b.status]} icon={b.status === 'confirmed' ? 'ph-fill ph-check' : 'ph-fill ph-clock'}>
              {b.status === 'confirmed' ? tr('Confirmed') : tr('Pending')}</Badge></span>
            <button style={{ all: 'unset', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <i className="ph ph-dots-three-vertical" style={{ fontSize: 18, color: C.fg3 }} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── Calendar ─────────────────────────────────────────────────── */
function CalendarView() {
  const events = {
    10: { label: 'Birthday Bash', tone: 'gold' },
    14: { label: 'Aisha & Omar', tone: 'purple' },
    22: { label: 'Site visit', tone: 'lav' },
    28: { label: 'Layla Engagement', tone: 'green' },
  };
  const toneBg = { gold: [C.gold100, C.gold600], purple: [C.purple50, C.brand], lav: [C.lavender100, '#6F539C'],
    green: [C.emerald100, C.emerald] };
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // March starts ~Sat; offset
  return (
    <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, color: C.ink }}>{isAR() ? 'مارس ٢٠٢٦' : 'March 2026'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={navBtn()}><i className="ph ph-caret-left" style={{ fontSize: 16 }} /></button>
            <button style={navBtn()}><i className="ph ph-caret-right" style={{ fontSize: 16 }} /></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontFamily: SANS, fontSize: 11.5, fontWeight: 600,
              color: C.fg3, padding: '4px 0' }}>{d}</div>
          ))}
          {days.map((d, i) => {
            const valid = d >= 1 && d <= 31;
            const ev = events[d];
            return (
              <div key={i} style={{ minHeight: 74, borderRadius: 10, padding: 7,
                border: `1px solid ${ev ? toneBg[ev.tone][1] + '55' : C.border}`,
                background: valid ? (ev ? toneBg[ev.tone][0] : C.surface) : 'transparent' }}>
                {valid && <>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600,
                    color: ev ? toneBg[ev.tone][1] : C.fg2 }}>{trNum(d)}</div>
                  {ev && <div style={{ marginTop: 5, fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
                    color: '#fff', background: toneBg[ev.tone][1], borderRadius: 6, padding: '3px 5px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.label}</div>}
                </>}
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{tr('This month')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(events).map(([d, ev]) => (
              <div key={d} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: toneBg[ev.tone][0],
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: toneBg[ev.tone][1], lineHeight: 1 }}>{trNum(d)}</span>
                  <span style={{ fontFamily: SANS, fontSize: 9, color: toneBg[ev.tone][1] }}>{isAR() ? 'مارس' : 'MAR'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>{tr(ev.label)}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{trCity('Riyadh')}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Btn icon="ph-plus" variant="secondary">{tr('Add event / block date')}</Btn>
      </div>
    </div>
  );
}
function navBtn() {
  return { all: 'unset', cursor: 'pointer', width: 32, height: 32, borderRadius: 9,
    border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', color: C.fg2 };
}

/* ── Earnings ─────────────────────────────────────────────────── */
function EarningsView() {
  const payouts = [
    { client: 'Aisha & Omar', date: '12 Mar 2026', amount: 4800, type: 'Deposit', status: 'Paid' },
    { client: 'Orbit Co.', date: '08 Mar 2026', amount: 7600, type: 'Deposit', status: 'Paid' },
    { client: 'Mona Khalid', date: '02 Mar 2026', amount: 6800, type: 'Final', status: 'Paid' },
    { client: 'Layla Ahmed', date: '—', amount: 3200, type: 'Deposit', status: 'Pending' },
  ];
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <Card style={{ background: 'linear-gradient(140deg,#5B2C83,#3A1B52)', border: 'none', position: 'relative',
          overflow: 'hidden' }}>
          <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
            style={{ position: 'absolute', right: -16, bottom: -20, width: 110, opacity: 0.2 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{tr('Available balance')}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: '#fff', margin: '6px 0 14px' }}>SAR 19,200</div>
            <Btn variant="gold" size="sm" icon="ph-bank">{tr('Withdraw')}</Btn>
          </div>
        </Card>
        <Card pad={18}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3 }}>{tr('This month')}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.ink, margin: '6px 0' }}>SAR 84,000</div>
          <Badge tone="green" icon="ph-bold ph-arrow-up">{isAR() ? '+١٨٪ مقابل فبراير' : '+18% vs Feb'}</Badge>
        </Card>
        <Card pad={18}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3 }}>{tr('Pending payouts')}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.ink, margin: '6px 0' }}>SAR 3,200</div>
          <Badge tone="amber" icon="ph-fill ph-clock">{isAR() ? '١ قيد الانتظار' : '1 awaiting'}</Badge>
        </Card>
      </div>

      <Card pad={0}>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink, padding: '18px 22px 12px' }}>{tr('Transactions')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 22px',
          borderTop: `1px solid ${C.border}`, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.fg3,
          textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span>{tr('Client')}</span><span>{tr('Date')}</span><span>{tr('Type')}</span><span style={{ textAlign: 'right' }}>{tr('Amount')}</span>
        </div>
        {payouts.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '13px 22px',
            borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: p.status === 'Paid' ? C.emerald100 : C.amber100,
                display: 'grid', placeItems: 'center' }}>
                <i className={`ph-fill ${p.status === 'Paid' ? 'ph-arrow-down-left' : 'ph-clock'}`}
                  style={{ fontSize: 16, color: p.status === 'Paid' ? C.emerald : C.amber }} />
              </div>
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{p.client}</span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{trDate(p.date)}</span>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{tr(p.type)}</span>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink, textAlign: 'right' }}>
              SAR {p.amount.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

Object.assign(window, { BookingsView, CalendarView, EarningsView });
