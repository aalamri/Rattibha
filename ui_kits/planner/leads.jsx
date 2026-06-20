/* Rattibha Planner Dashboard — Leads & Offers + send-offer drawer. */

function LeadsView({ go }) {
  const [filter, setFilter] = React.useState('all');
  const tabs = [
    { k: 'all', label: 'All' }, { k: 'pending', label: 'Pending' }, { k: 'viewed', label: 'Viewed' },
    { k: 'accepted', label: 'Accepted' }, { k: 'declined', label: 'Declined' },
  ];
  const list = LEADS.filter(l => filter === 'all' ? true : l.offerStatus === filter);
  const tone = { pending: 'amber', viewed: 'purple', accepted: 'green', declined: 'gray' };
  const icon = { pending: 'ph-fill ph-clock', viewed: 'ph-fill ph-eye', accepted: 'ph-fill ph-check-circle', declined: 'ph-fill ph-x-circle' };
  const label = { pending: 'Pending', viewed: 'Client viewed', accepted: 'Accepted', declined: 'Declined' };
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* intro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: C.purple50, borderRadius: 14,
        padding: '12px 16px' }}>
        <i className="ph-fill ph-paper-plane-tilt" style={{ fontSize: 19, color: C.brand }} />
        <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: C.ink }}>
          {tr('Quotes you’ve sent to clients · track their status here. New briefs to bid on live under')} <b>{tr('Open requests')}</b>.</span>
      </div>
      {/* filter tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(t => {
            const on = filter === t.k;
            const count = t.k === 'all' ? LEADS.length : LEADS.filter(l => l.offerStatus === t.k).length;
            return (
              <button key={t.k} onClick={() => setFilter(t.k)} style={{ all: 'unset', cursor: 'pointer',
                fontFamily: SANS, fontSize: 13.5, fontWeight: 600, padding: '8px 15px', borderRadius: 999,
                background: on ? C.brand : C.surface, color: on ? '#fff' : C.fg2,
                border: `1.5px solid ${on ? C.brand : C.border}` }}>
                {tr(t.label)} <span style={{ opacity: 0.7 }}>· {count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* offer cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {list.map(l => (
          <Card key={l.id} pad={18} style={{ cursor: 'pointer' }}>
            <div onClick={() => go && go('deal', l)}>
            <div style={{ display: 'flex', gap: 13 }}>
              <Avatar seed={l.seed} size={46} initials={l.initials} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{l.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3, marginTop: 1 }}>{tr('Sent')} {l.sent}</div>
                  </div>
                  <Badge tone={tone[l.offerStatus]} icon={icon[l.offerStatus]}>{tr(label[l.offerStatus])}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '14px 0' }}>
              <Badge tone="lav" icon="ph-confetti">{tr(l.type)}</Badge>
              <Badge tone="gray" icon="ph-calendar-blank">{trDate(l.date)}</Badge>
              <Badge tone="gray" icon="ph-map-pin">{trCity(l.city)}</Badge>
            </div>

            <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: C.fg2, margin: '0 0 14px' }}>“{l.note}”</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{tr('Your quote')}</div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.brand }}>SAR {l.quote}</div>
              </div>
              {l.offerStatus === 'accepted'
                ? <Btn icon="ph-arrow-right" onClick={() => go && go('deal', l)}>{tr('Track deal')}</Btn>
                : l.offerStatus === 'declined'
                  ? <Btn variant="secondary" icon="ph-arrow-counter-clockwise">{tr('Re-quote')}</Btn>
                  : <Btn variant="secondary" icon="ph-chat-circle" onClick={() => go && go('messages')}>{tr('Message')}</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OfferDrawer({ lead, onClose, go }) {
  const [pkg, setPkg] = React.useState(1);
  const packages = [
    { name: 'Essentials', price: 12000, note: 'Coordination + styling' },
    { name: 'Signature', price: 18000, note: 'Full planning + décor + catering' },
    { name: 'Luxe', price: 28000, note: 'End-to-end production' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(43,34,51,0.45)' }} />
      <div style={{ position: 'relative', width: 420, height: '100%', background: C.surface, display: 'flex',
        flexDirection: 'column', boxShadow: '-20px 0 50px -20px rgba(43,34,51,0.4)' }}>
        {/* header */}
        <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}>{tr('Send an offer')}</div>
            <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 34, height: 34,
              borderRadius: 10, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}>
              <i className="ph ph-x" style={{ fontSize: 17, color: C.fg2 }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <Avatar seed={lead.seed} size={40} initials={lead.initials} />
            <div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{lead.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{lead.type} · {lead.date} · {lead.guests} guests</div>
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <FieldLabel>{tr('Choose a package')}</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {packages.map((p, i) => {
              const on = pkg === i;
              return (
                <button key={i} onClick={() => setPkg(i)} style={{ all: 'unset', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14,
                    border: `1.5px solid ${on ? C.brand : C.border}`, background: on ? C.purple50 : C.surface }}>
                    <div style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                      border: `2px solid ${on ? C.brand : C.borderStrong}`, display: 'grid', placeItems: 'center' }}>
                      {on && <div style={{ width: 10, height: 10, borderRadius: 999, background: C.brand }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{p.name}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{p.note}</div>
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.brand }}>SAR {p.price.toLocaleString()}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <FieldLabel>{tr('Your price (SAR)')}</FieldLabel>
          <FakeInput value={packages[pkg].price.toLocaleString()} icon="ph-currency-circle-dollar" />

          <div style={{ height: 16 }} />
          <FieldLabel>{tr('Message to client')}</FieldLabel>
          <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 13, padding: '12px 14px', background: C.bg,
            fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.5, minHeight: 84 }}>
            {isAR()
              ? `مرحبًا ${lead.name.split(' ')[0]}، يسعدنا تحقيق ${tr(lead.type)} الخاص بك! تشمل باقة ${packages[pkg].name} التخطيط والتنسيق الكامل. يسعدنا تخصيص كل تفصيل — لنتحدّث. ✨`
              : <>Hi {lead.name.split(' ')[0]}, we’d love to bring your {lead.type.toLowerCase()} to life! Our {packages[pkg].name} package includes {packages[pkg].note.toLowerCase()}. Happy to tailor every detail — let’s chat. ✨</>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <i className="ph ph-paperclip" style={{ fontSize: 18, color: C.brand }} />
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand }}>{tr('Attach portfolio / moodboard')}</span>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: 20, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
          <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>{tr('Cancel')}</Btn>
          <Btn icon="ph-paper-plane-right" onClick={() => { onClose(); go && go('deal', { ...lead, status: 'offer-sent' }); }} style={{ flex: 1.4 }}>{tr('Send offer')}</Btn>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 8 }}>{children}</div>;
}
function FakeInput({ value, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface,
      border: `1.5px solid ${C.borderStrong}`, borderRadius: 13, padding: '12px 14px' }}>
      {icon && <i className={`ph ${icon}`} style={{ fontSize: 18, color: C.fg3 }} />}
      <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{value}</span>
    </div>
  );
}

Object.assign(window, { LeadsView, OfferDrawer });
