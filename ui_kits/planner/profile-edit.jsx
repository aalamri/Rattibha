/* Rattibha Planner Dashboard — Editable Profile / Storefront.
   Edit details, replace cover + logo + portfolio images, manage services (name + image).
   Uses globals (C, SANS, DISPLAY, GRADS, Photo, Card, Badge, Btn, PLANNER). */

const SERVICES_SEED = [
  { id: 's1', name: 'Full Wedding Planning', from: '18,000', seed: 0, desc: 'End-to-end planning, styling & coordination.' },
  { id: 's2', name: 'Luxury Gala Production', seed: 5, from: '42,000', desc: 'Stage, lighting, AV & show production.' },
  { id: 's3', name: 'Engagement & Milkah', seed: 3, from: '12,000', desc: 'Intimate styling, florals & catering.' },
];

/* image placeholder with an editable camera overlay */
function EditableImage({ seed, style, label, round, onReplace }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Photo seed={seed} style={{ width: '100%', height: '100%', borderRadius: round || 12 }} />
      <button onClick={onReplace} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', inset: 0,
        borderRadius: round || 12, display: 'grid', placeItems: 'center', background: 'rgba(43,34,51,0.32)',
        opacity: 0, transition: 'opacity .15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#fff' }}>
          <i className="ph-fill ph-camera" style={{ fontSize: 22 }} />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600 }}>{label || 'Replace'}</span>
        </div>
      </button>
    </div>
  );
}

function EditField({ label, value, multiline, suffix }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1.5px solid ${C.borderStrong}`,
        borderRadius: 12, padding: multiline ? '12px 14px' : '11px 14px', background: C.surface,
        minHeight: multiline ? 76 : 'auto' }}>
        <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{value}</span>
        {suffix && <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ProfileEditView({ go }) {
  const [services, setServices] = React.useState(SERVICES_SEED);
  const [adding, setAdding] = React.useState(false);

  const removeService = id => setServices(s => s.filter(x => x.id !== id));
  const addService = (svc) => { setServices(s => [...s, { ...svc, id: 's' + Date.now() }]); setAdding(false); };

  return (
    <div style={{ padding: 28 }}>
      <DetailHeader onBack={() => go('profile')} crumb={tr('Profile') + ' / ' + tr('Edit storefront')}>
        <Btn variant="secondary" size="sm" onClick={() => go('profile')}>{tr('Cancel')}</Btn>
        <Btn size="sm" icon="ph-check" onClick={() => go('profile')}>{tr('Save changes')}</Btn>
      </DetailHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* cover + logo + identity */}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <EditableImage seed={0} label={tr('Replace cover')} round={0} style={{ height: 140 }} />
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -38 }}>
                <EditableImage seed={2} label={tr('Logo')} round={22} style={{ width: 88, height: 88,
                  border: `4px solid ${C.surface}`, borderRadius: 22 }} />
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <Badge tone="gold" icon="ph-fill ph-crown-simple">{tr('Premium')}</Badge>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <EditField label={tr('Studio name')} value={PLANNER.name} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <EditField label={tr('Specialty')} value={isAR() ? 'أعراس وحفلات' : 'Weddings & Galas'} />
                  <EditField label={tr('City')} value={trCity('Riyadh')} />
                </div>
                <EditField label={tr('Bio')} multiline
                  value={isAR() ? 'استوديو فاخر حائز على جوائز لتنسيق الأعراس والحفلات الكبرى في أنحاء المملكة.' : 'Award-winning luxury wedding & gala studio crafting unforgettable celebrations across the Kingdom.'} />
              </div>
            </div>
          </Card>

          {/* SERVICES manager */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Services')}</div>
              {!adding && <Btn size="sm" icon="ph-plus" onClick={() => setAdding(true)}>{tr('Add service')}</Btn>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {services.map(svc => (
                <div key={svc.id} style={{ display: 'flex', gap: 13, alignItems: 'center', border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: 12 }}>
                  <EditableImage seed={svc.seed} label={tr('Edit')} style={{ width: 64, height: 64, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>{svc.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{svc.desc}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.brand, marginTop: 4 }}>
                      From SAR {svc.from}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button style={{ all: 'unset', cursor: 'pointer', width: 32, height: 32, borderRadius: 8,
                      background: C.purple50, display: 'grid', placeItems: 'center' }}>
                      <i className="ph ph-pencil-simple" style={{ fontSize: 16, color: C.brand }} />
                    </button>
                    <button onClick={() => removeService(svc.id)} style={{ all: 'unset', cursor: 'pointer', width: 32,
                      height: 32, borderRadius: 8, background: '#F6DED9', display: 'grid', placeItems: 'center' }}>
                      <i className="ph ph-trash" style={{ fontSize: 16, color: '#C24436' }} />
                    </button>
                  </div>
                </div>
              ))}

              {adding && <AddServiceForm onCancel={() => setAdding(false)} onAdd={addService} />}
            </div>
          </Card>
        </div>

        {/* right: portfolio gallery management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Portfolio photos')}</div>
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>8 / 20</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ position: 'relative' }}>
                  <EditableImage seed={i} label={tr('Replace')} style={{ height: 76 }} />
                  <button style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 5, right: 5, width: 22,
                    height: 22, borderRadius: 999, background: 'rgba(43,34,51,0.6)', display: 'grid', placeItems: 'center' }}>
                    <i className="ph-bold ph-x" style={{ fontSize: 12, color: '#fff' }} />
                  </button>
                </div>
              ))}
              <button style={{ all: 'unset', cursor: 'pointer', height: 76, borderRadius: 12,
                border: `1.5px dashed ${C.borderStrong}`, background: C.purple50, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <i className="ph ph-plus" style={{ fontSize: 20, color: C.brand }} />
                <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.brand }}>{tr('Add')}</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, background: C.gold100,
              borderRadius: 10, padding: '10px 12px' }}>
              <i className="ph-fill ph-lightbulb" style={{ fontSize: 17, color: C.gold600 }} />
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: '#7a5e15', lineHeight: 1.4 }}>
                Studios with 8+ photos get 3× more requests.</span>
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{tr('Event categories')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[['Weddings', true], ['Galas', true], ['Engagements', true], ['Corporate', false], ['Birthdays', false]].map(([t, on]) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS,
                  fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.purple50 : C.surface,
                  color: on ? C.brand : C.fg3, cursor: 'pointer' }}>
                  {on && <i className="ph-bold ph-check" style={{ fontSize: 12 }} />}{tr(t)}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddServiceForm({ onCancel, onAdd }) {
  const presets = [
    { name: 'Themed Birthday Party', from: '6,800', seed: 4, desc: 'Custom theme, décor & entertainment.' },
    { name: 'Corporate Launch', from: '38,000', seed: 2, desc: 'Stage, branding & full production.' },
    { name: 'Garden Reception', from: '22,000', seed: 1, desc: 'Outdoor styling, florals & catering.' },
  ];
  const [pick, setPick] = React.useState(0);
  const p = presets[pick];
  return (
    <div style={{ border: `1.5px solid ${C.brand}`, borderRadius: 14, padding: 14, background: C.purple50 }}>
      <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{tr('New service')}</div>
      <div style={{ display: 'flex', gap: 13 }}>
        <EditableImage seed={p.seed} label={tr('Add image')} style={{ width: 64, height: 64, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.fg2, marginBottom: 6 }}>{tr('Service name')}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {presets.map((pr, i) => (
              <button key={i} onClick={() => setPick(i)} style={{ all: 'unset', cursor: 'pointer', fontFamily: SANS,
                fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 999,
                border: `1.5px solid ${pick === i ? C.brand : C.borderStrong}`,
                background: pick === i ? '#fff' : 'transparent', color: pick === i ? C.brand : C.fg2 }}>{pr.name}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
            border: `1.5px solid ${C.borderStrong}`, borderRadius: 10, padding: '9px 12px' }}>
            <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('From SAR')}</span>
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>{p.from}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" size="sm" onClick={onCancel}>{tr('Cancel')}</Btn>
        <Btn size="sm" icon="ph-plus" onClick={() => onAdd(p)}>{tr('Add service')}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileEditView, SERVICES_SEED });
