/* Rattibha Planner Dashboard — Lead detail + Booking detail views.
   Open from LeadsView cards and BookingsView rows via go('leadDetail', lead) / go('bookingDetail', booking). */

function DetailHeader({ onBack, crumb, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <button onClick={onBack} style={{ all: 'unset', cursor: 'pointer', width: 40, height: 40, borderRadius: 11,
        border: `1px solid ${C.border}`, background: C.surface, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <i className="ph ph-arrow-left" style={{ fontSize: 18, color: C.ink }} />
      </button>
      <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3 }}>{crumb}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>{children}</div>
    </div>
  );
}

function Section({ title, action, children, style }) {
  return (
    <Card style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: title ? 16 : 0 }}>
        {title && <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{title}</div>}
        {action}
      </div>
      {children}
    </Card>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: C.purple50, display: 'grid',
        placeItems: 'center', flexShrink: 0 }}>
        <i className={`ph ${icon}`} style={{ fontSize: 17, color: C.brand }} />
      </div>
      <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{label}</span>
      <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{value}</span>
    </div>
  );
}

/* ── Lead detail ──────────────────────────────────────────────── */
function LeadDetailView({ lead, go }) {
  const l = lead || LEADS[0];
  const sent = l.status === 'offer-sent';
  return (
    <div style={{ padding: 28 }}>
      <DetailHeader onBack={() => go('leads')} crumb={tr('Open requests') + ' / ' + tr('Request')}>
        <Btn variant="secondary" size="sm" icon="ph-chat-circle" onClick={() => go('messages')}>{tr('Message')}</Btn>
        {sent
          ? <Btn size="sm" icon="ph-arrow-right" onClick={() => go('deal', l)}>{tr('Track deal')}</Btn>
          : <Btn size="sm" icon="ph-paper-plane-right" onClick={() => go('leads')}>{tr('Send offer')}</Btn>}
      </DetailHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* client header */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar seed={l.seed} size={62} initials={l.initials} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}>{l.name}</span>
                  <Badge tone={sent ? 'green' : 'purple'} icon={sent ? 'ph-fill ph-check' : 'ph-fill ph-sparkle'}>
                    {sent ? tr('Offer sent') : tr('New lead')}</Badge>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3, marginTop: 3 }}>
                  Posted {l.posted} · responds in ~1 hour
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              <Badge tone="lav" icon="ph-confetti">{l.type}</Badge>
              <Badge tone="gray" icon="ph-calendar-blank">{trDate(l.date)}</Badge>
              <Badge tone="gray" icon="ph-users-three">{l.guests} {tr('guests')}</Badge>
              <Badge tone="gray" icon="ph-map-pin">{l.city}</Badge>
            </div>
          </Section>

          {/* request brief */}
          <Section title={tr('Event brief')}>
            <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.65, color: C.fg2, margin: 0 }}>“{l.note}”</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {(isAR() ? ['قاعة حديقة', 'وردي وذهبي', 'ضيافة كاملة', 'تنسيق زهور', 'تصوير'] : ['Garden venue', 'Soft rose & gold', 'Full catering', 'Live florals', 'Photography']).map(t => (
                <span key={t} style={{ fontFamily: SANS, fontSize: 12.5, color: C.brand, background: C.purple50,
                  borderRadius: 999, padding: '6px 12px' }}>{t}</span>
              ))}
            </div>
          </Section>

          {/* requirements */}
          <Section title={tr('Requirements')}>
            <InfoRow icon="ph-confetti" label={tr('Event type')} value={tr(l.type)} />
            <InfoRow icon="ph-calendar-blank" label={tr('Preferred date')} value={trDate(l.date)} />
            <InfoRow icon="ph-users-three" label={tr('Guest count')} value={`${l.guests} ${tr('guests')}`} />
            <InfoRow icon="ph-map-pin" label={tr('Location')} value={trCity(l.city)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.gold100, display: 'grid',
                placeItems: 'center', flexShrink: 0 }}>
                <i className="ph ph-wallet" style={{ fontSize: 17, color: C.gold600 }} />
              </div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{tr('Budget range')}</span>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>SAR {l.budget}</span>
            </div>
          </Section>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section style={{ background: 'linear-gradient(150deg,#5B2C83,#3A1B52)', border: 'none',
            position: 'relative', overflow: 'hidden' }}>
            <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
              style={{ position: 'absolute', right: -18, bottom: -22, width: 110, opacity: 0.18 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{tr('Match score')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '4px 0 12px' }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 700, color: '#fff' }}>92%</span>
                <span style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>{tr('fit for your studio')}</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
                margin: '0 0 14px' }}>{tr('Matches your category, city and budget tier. Respond fast to win it.')}</p>
              {!sent && <Btn variant="gold" icon="ph-paper-plane-right" onClick={() => go('leads')}
                style={{ width: '100%' }}>{tr('Send offer now')}</Btn>}
            </div>
          </Section>

          <Section title={tr('Client')}>
            <InfoRow icon="ph-star" label={tr('Events booked')} value="3" />
            <InfoRow icon="ph-clock" label={tr('Avg. response')} value={isAR() ? 'أقل من ساعتين' : '< 2 hours'} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.emerald100, display: 'grid',
                placeItems: 'center', flexShrink: 0 }}>
                <i className="ph-fill ph-seal-check" style={{ fontSize: 17, color: C.emerald }} />
              </div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{tr('Verified client')}</span>
              <Badge tone="green">{tr('Yes')}</Badge>
            </div>
          </Section>

          <Section title={tr('Other planners')}>
            <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg2, lineHeight: 1.5 }}>
              {isAR()
                ? <><b style={{ color: C.ink }}>٣ استوديوهات</b> اطّلعت على هذا الطلب · <b style={{ color: C.ink }}>١</b> أرسل عرضًا.</>
                : <><b style={{ color: C.ink }}>3 studios</b> have viewed this lead · <b style={{ color: C.ink }}>1</b> has sent an offer.</>}
            </div>
            <div style={{ display: 'flex', marginTop: 12 }}>
              {[6, 2, 4].map((s, i) => <div key={i} style={{ marginLeft: i ? -10 : 0 }}>
                <Avatar seed={s} size={32} initials="" ring /></div>)}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Booking detail ───────────────────────────────────────────── */
function BookingDetailView({ booking, go }) {
  const b = booking || BOOKINGS[0];
  const pct = Math.round((b.paid / b.value) * 100);
  const timeline = [
    { t: 'Booking confirmed', d: tr('Deposit received'), done: true, icon: 'ph-check' },
    { t: 'Planning & design', d: isAR() ? 'لوحة الإلهام + القاعة' : 'Moodboard + venue', done: b.stage !== 'Awaiting deposit', icon: 'ph-palette' },
    { t: 'Vendor coordination', d: isAR() ? 'ضيافة وزهور وصوتيات' : 'Catering, florals, AV', done: ['Final walkthrough'].includes(b.stage), icon: 'ph-handshake' },
    { t: 'Final walkthrough', d: isAR() ? 'قبل أسبوع' : '1 week before', done: b.stage === 'Final walkthrough', icon: 'ph-clipboard-text' },
    { t: 'Event day', d: b.date, done: false, icon: 'ph-confetti' },
  ];
  const tasks = [
    { t: 'Share moodboard with client', done: true },
    { t: 'Confirm venue booking', done: true },
    { t: 'Finalize catering menu', done: false },
    { t: 'Send final invoice', done: false },
  ];
  return (
    <div style={{ padding: 28 }}>
      <DetailHeader onBack={() => go('bookings')} crumb={tr('Bookings') + ' / ' + tr('Event')}>
        <Btn variant="secondary" size="sm" icon="ph-chat-circle" onClick={() => go('messages')}>{tr('Message client')}</Btn>
        <Btn size="sm" icon="ph-pencil-simple">{tr('Manage')}</Btn>
      </DetailHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* header */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar seed={b.seed} size={62} initials={b.initials} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}>{b.client}</span>
                  <Badge tone={b.status === 'confirmed' ? 'green' : 'amber'}
                    icon={b.status === 'confirmed' ? 'ph-fill ph-check' : 'ph-fill ph-clock'}>
                    {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}</Badge>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3, marginTop: 3 }}>{b.pkg} · {trDate(b.date)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{tr('Event value')}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: C.brand }}>SAR {b.value.toLocaleString()}</div>
              </div>
            </div>
          </Section>

          {/* timeline */}
          <Section title={tr('Event timeline')}>
            {timeline.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                    background: s.done ? C.brand : C.surface, border: `1.5px solid ${s.done ? C.brand : C.borderStrong}`,
                    display: 'grid', placeItems: 'center' }}>
                    <i className={`ph ${s.done ? 'ph-check' : s.icon}`} style={{ fontSize: 16, color: s.done ? '#fff' : C.fg3 }} />
                  </div>
                  {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26,
                    background: s.done ? C.brand : C.border, marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 18, paddingTop: 4 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: s.done ? C.ink : C.fg2 }}>{tr(s.t)}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </Section>

          {/* tasks */}
          <Section title={tr('Planning checklist')} action={<span style={{ fontFamily: SANS, fontSize: 13,
            fontWeight: 600, color: C.brand, cursor: 'pointer' }}>{tr('+ Add task')}</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0',
                  borderBottom: i < tasks.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    background: t.done ? C.brand : C.surface, border: `1.5px solid ${t.done ? C.brand : C.borderStrong}`,
                    display: 'grid', placeItems: 'center' }}>
                    {t.done && <i className="ph-bold ph-check" style={{ fontSize: 13, color: '#fff' }} />}
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 13.5, color: t.done ? C.fg3 : C.ink,
                    textDecoration: t.done ? 'line-through' : 'none' }}>{tr(t.t)}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* payment */}
          <Section title={tr('Payment')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{tr('Paid so far')}</span>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>{pct}%</span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: C.purple50, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#5B2C83,#B6A1D4)' }} />
            </div>
            <InfoRow icon="ph-check-circle" label={tr('Deposit')} value={`SAR ${b.paid.toLocaleString()}`} />
            <InfoRow icon="ph-hourglass-medium" label={tr('Balance')} value={`SAR ${(b.value - b.paid).toLocaleString()}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>{tr('Total')}</span>
              <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: C.brand }}>SAR {b.value.toLocaleString()}</span>
            </div>
          </Section>

          <Section title={tr('Details')}>
            <InfoRow icon="ph-package" label={tr('Package')} value={b.pkg} />
            <InfoRow icon="ph-calendar-blank" label={tr('Event date')} value={trDate(b.date)} />
            <InfoRow icon="ph-flag" label={tr('Stage')} value={tr(b.stage)} />
          </Section>

          <Btn variant="secondary" icon="ph-file-text" style={{ width: '100%' }}>Download contract</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LeadDetailView, BookingDetailView });
