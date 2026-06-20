/* Rattibha Planner Dashboard — Deal / Agreement view.
   Mirrors the customer deal lifecycle from the planner's side:
   request received → offer sent → client accepted → countersign contract → deposit received → event.
   Opened via go('deal', lead) from LeadDetailView / LeadsView (offer-sent leads). */

function DealView({ lead, go }) {
  const l = lead || LEADS[2];
  // current stage index in the shared timeline (0..5)
  const stage = 3; // client accepted, awaiting planner countersign
  const price = 18000, deposit = 3600;

  const steps = [
    { t: 'Request received', who: 'Client', d: `${tr(l.type)} · ${l.guests} ${tr('guests')} · ${trDate(l.date)}`, icon: 'ph-tray-arrow-down' },
    { t: 'Offer sent', who: 'You', d: isAR() ? 'باقة سيقناتشر · ١٨٬٠٠٠ ريال' : 'Signature package · SAR 18,000', icon: 'ph-paper-plane-right' },
    { t: 'Client accepted', who: 'Client', d: isAR() ? 'قبل عرضك' : 'Accepted your offer', icon: 'ph-thumbs-up' },
    { t: 'Countersign contract', who: 'You', d: isAR() ? 'وقّع اتفاقية الخدمة' : 'Sign the service agreement', icon: 'ph-pen-nib' },
    { t: 'Deposit received', who: 'Client', d: `SAR ${deposit.toLocaleString()} (20%)`, icon: 'ph-currency-circle-dollar' },
    { t: 'Event day', who: '', d: l.date, icon: 'ph-confetti' },
  ];

  return (
    <div style={{ padding: 28 }}>
      <DetailHeader onBack={() => go('leads')} crumb={tr('My Offers') + ' / ' + tr('Deal')}>
        <Btn variant="secondary" size="sm" icon="ph-chat-circle" onClick={() => go('messages')}>{tr('Message client')}</Btn>
        <Btn size="sm" icon="ph-pen-nib">{tr('Countersign')}</Btn>
      </DetailHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* client + status banner */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar seed={l.seed} size={56} initials={l.initials} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 600, color: C.ink }}>{l.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3, marginTop: 2 }}>{tr(l.type)} · {trCity(l.city)} · {l.guests} {tr('guests')}</div>
              </div>
              <Badge tone="amber" icon="ph-fill ph-pen-nib">{tr('Awaiting your signature')}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, background: '#F6E7C4',
              borderRadius: 12, padding: '12px 14px' }}>
              <i className="ph-fill ph-info" style={{ fontSize: 19, color: '#B5881A' }} />
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: '#7a5e15', lineHeight: 1.45 }}>
                {isAR()
                  ? <>{l.name.split(' ')[0]} قبل عرضك. <b>وقّع الاتفاقية المقابلة</b> لتأكيد الحجز — يُحوّل العربون إليك عند التوقيع.</>
                  : <>{l.name.split(' ')[0]} accepted your offer. <b>Countersign the contract</b> to lock the booking — the deposit is released to you on signing.</>}</span>
            </div>
          </Section>

          {/* shared timeline */}
          <Section title={tr('Deal timeline')}>
            {steps.map((s, i) => {
              const done = i < stage, active = i === stage;
              return (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                      background: done ? C.brand : active ? '#F6E7C4' : C.surface,
                      border: active ? 'none' : done ? 'none' : `1.5px solid ${C.borderStrong}`,
                      display: 'grid', placeItems: 'center' }}>
                      <i className={`${done ? 'ph-bold' : 'ph'} ${done ? 'ph-check' : s.icon}`}
                        style={{ fontSize: 16, color: done ? '#fff' : active ? '#B5881A' : C.fg3 }} />
                    </div>
                    {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26,
                      background: done ? C.brand : C.border, marginTop: 2 }} />}
                  </div>
                  <div style={{ paddingBottom: 18, paddingTop: 4, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600,
                        color: done || active ? C.ink : C.fg2 }}>{tr(s.t)}</span>
                      {active && <Badge tone="amber">{tr('Now')}</Badge>}
                      {s.who && <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600,
                        color: s.who === 'You' ? C.brand : C.fg3, background: s.who === 'You' ? C.purple50 : '#EEEAF2',
                        borderRadius: 999, padding: '2px 8px' }}>{s.who}</span>}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 2 }}>{s.d}</div>
                  </div>
                </div>
              );
            })}
          </Section>

          {/* contract to countersign */}
          <Section title={tr('Service agreement')} action={<Badge tone="amber" icon="ph-fill ph-clock">{tr('Action needed')}</Badge>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '4px 0 14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: C.purple50, display: 'grid',
                placeItems: 'center' }}>
                <i className="ph-fill ph-file-text" style={{ fontSize: 22, color: C.brand }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{tr('Event Services Agreement')}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{isAR() ? 'رقم RTB-2026-0314 · وقّعه العميل ✓' : 'Ref RTB-2026-0314 · signed by client ✓'}</div>
              </div>
              <Btn size="sm" variant="secondary" icon="ph-eye">{tr('View')}</Btn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.bg, borderRadius: 12,
              padding: '14px 16px', border: `1.5px dashed ${C.borderStrong}` }}>
              <i className="ph ph-signature" style={{ fontSize: 24, color: C.fg3 }} />
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{tr('Your countersignature required')}</span>
              <Btn size="sm" icon="ph-pen-nib">{tr('Sign now')}</Btn>
            </div>
          </Section>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title={tr('Deal summary')}>
            <InfoRow icon="ph-package" label={tr('Package')} value={tr('Signature')} />
            <InfoRow icon="ph-confetti" label={tr('Event')} value={tr(l.type)} />
            <InfoRow icon="ph-calendar-blank" label={tr('Date')} value={trDate(l.date)} />
            <InfoRow icon="ph-users-three" label={tr('Guests')} value={l.guests} />
          </Section>

          <Section title={tr('Payment')}>
            <InfoRow icon="ph-tag" label={tr('Total fee')} value={`SAR ${price.toLocaleString()}`} />
            <InfoRow icon="ph-hourglass-medium" label={tr('Deposit (on signing)')} value={`SAR ${deposit.toLocaleString()}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{tr('Your earnings (after fee)')}</span>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.emerald }}>SAR {(price * 0.85).toLocaleString()}</span>
            </div>
          </Section>

          <Section style={{ background: 'linear-gradient(150deg,#5B2C83,#3A1B52)', border: 'none',
            position: 'relative', overflow: 'hidden' }}>
            <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
              style={{ position: 'absolute', right: -18, bottom: -22, width: 110, opacity: 0.18 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{tr('One step away')}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {tr('Countersign to confirm the booking')}</div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
                margin: '8px 0 14px' }}>{tr('The deposit releases to your balance the moment you sign.')}</p>
              <Btn variant="gold" icon="ph-pen-nib" style={{ width: '100%' }}>{tr('Countersign now')}</Btn>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DealView });
