/* Rattibha Planner Dashboard — Open Requests board (marketplace feed of posted briefs).
   Planner browses customer requests and submits a proposal. Mirrors the customer "Post a request".
   Uses globals (C, SANS, DISPLAY, Btn, Badge, Avatar, Card, DetailHeader, Section, InfoRow). */

const OPEN_REQUESTS = [
  { id: 'q1', name: 'Noura A.', initials: 'N', seed: 1, cat: 'Wedding', icon: 'ph-heart-straight',
    tint: '#F2EAF7', color: '#4B0082', guests: 150, city: 'Riyadh', date: '14 Mar 2026', budget: '10–20k',
    posted: '2h ago', offers: 3, match: 96, verified: true,
    note: 'Elegant garden wedding in soft rose & gold. Looking for full planning, styling, catering and florals.' },
  { id: 'q2', name: 'Mansour K.', initials: 'M', seed: 2, cat: 'Corporate', icon: 'ph-briefcase',
    tint: '#E4D4EF', color: '#3D0069', guests: 300, city: 'Riyadh', date: '02 May 2026', budget: '35k+',
    posted: '5h ago', offers: 5, match: 88, verified: true,
    note: 'Annual company gala — stage production, AV, catering and awards ceremony for 300.' },
  { id: 'q3', name: 'Latifa S.', initials: 'L', seed: 4, cat: 'Engagement', icon: 'ph-balloon',
    tint: '#EADFF7', color: '#7B4FB0', guests: 80, city: 'Jeddah', date: '20 Apr 2026', budget: '10–20k',
    posted: '1d ago', offers: 2, match: 79, verified: false,
    note: 'Intimate engagement dinner with romantic styling and a live florals setup.' },
  { id: 'q4', name: 'Hessa M.', initials: 'H', seed: 3, cat: 'Gala', icon: 'ph-champagne',
    tint: '#F2E2A6', color: '#DAA520', guests: 200, city: 'Riyadh', date: '11 Jun 2026', budget: '20–35k',
    posted: '1d ago', offers: 4, match: 84, verified: true,
    note: 'Charity gala dinner — elegant ballroom styling, entertainment and full coordination.' },
  { id: 'q5', name: 'Abeer T.', initials: 'A', seed: 5, cat: 'Wedding', icon: 'ph-heart-straight',
    tint: '#F2EAF7', color: '#4B0082', guests: 250, city: 'Jeddah', date: '18 Apr 2026', budget: '20–35k',
    posted: '3h ago', offers: 2, match: 81, verified: true,
    note: 'Red Sea waterfront wedding — modern styling, florals and premium catering.' },
  { id: 'q6', name: 'Yousef A.', initials: 'Y', seed: 2, cat: 'Wedding', icon: 'ph-heart-straight',
    tint: '#F2EAF7', color: '#4B0082', guests: 180, city: 'Makkah', date: '05 May 2026', budget: '10–20k',
    posted: '6h ago', offers: 1, match: 90, verified: true,
    note: 'Walimah celebration with traditional hospitality and elegant hall styling.' },
  { id: 'q7', name: 'Reema S.', initials: 'R', seed: 1, cat: 'Engagement', icon: 'ph-balloon',
    tint: '#EADFF7', color: '#7B4FB0', guests: 90, city: 'Khobar', date: '28 Mar 2026', budget: '10–20k',
    posted: '8h ago', offers: 3, match: 86, verified: false,
    note: 'Seaside engagement with chic coastal décor and a live florals setup.' },
  { id: 'q8', name: 'Fahad M.', initials: 'F', seed: 3, cat: 'Birthday', icon: 'ph-cake',
    tint: '#F6E7C4', color: '#B5881A', guests: 40, city: 'Dammam', date: '12 Apr 2026', budget: '< 10k',
    posted: '1d ago', offers: 4, match: 77, verified: true,
    note: 'Kids birthday party — fun theme, balloons, cake and an energetic host.' },
];

function BrowseRequestsView({ go }) {
  const [cat, setCat] = React.useState('All');
  const [loading, setLoading] = React.useState(() => !window.__rtbBrowseLoaded);
  React.useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => { window.__rtbBrowseLoaded = true; setLoading(false); }, 1100);
    return () => clearTimeout(t);
  }, [loading]);
  const myCity = PLANNER.city; // Riyadh
  const [scope, setScope] = React.useState('city'); // 'city' = same city only, 'all' = all Saudi Arabia
  const cats = ['All', 'Wedding', 'Engagement', 'Birthday', 'Corporate', 'Gala'];
  const shown = OPEN_REQUESTS.filter(r => (cat === 'All' || r.cat === cat) && (scope === 'all' || r.city === myCity));
  return (
    <div style={{ padding: 28 }}>
      {/* city scope banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.purple50, borderRadius: 14,
        padding: '12px 16px', marginBottom: 16 }}>
        <i className="ph-fill ph-map-pin" style={{ fontSize: 19, color: C.brand }} />
        <div style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: C.ink }}>
          {tr('Showing requests in')} <b>{scope === 'city' ? trCity(myCity) : tr('All Saudi Arabia')}</b>
          <span style={{ color: C.fg3 }}> · {tr('you receive leads from clients in your city')}</span>
        </div>
        <div style={{ display: 'flex', background: C.surface, borderRadius: 999, padding: 3, border: `1px solid ${C.border}` }}>
          {[['city', trCity(myCity)], ['all', tr('All KSA')]].map(([k, label]) => {
            const on = scope === k;
            return <button key={k} onClick={() => setScope(k)} style={{ all: 'unset', cursor: 'pointer',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 700, padding: '6px 13px', borderRadius: 999,
              background: on ? C.brand : 'transparent', color: on ? '#fff' : C.fg2 }}>{label}</button>;
          })}
        </div>
      </div>

      {/* header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {cats.map(c => {
            const on = cat === c;
            return <button key={c} onClick={() => setCat(c)} style={{ all: 'unset', cursor: 'pointer',
              fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 999,
              border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.purple50 : C.surface,
              color: on ? C.brand : C.fg2 }}>{tr(c)}</button>;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 13, color: C.fg3,
          flexShrink: 0 }}>
          <i className="ph ph-funnel" style={{ fontSize: 16 }} />{shown.length} {tr('open')}
        </div>
      </div>

      {/* board */}
      {loading ? <BrowseSkeleton /> : shown.length === 0 ? (
        <PEmpty icon="ph-tray" title="No open requests here yet"
          body={scope === 'city' ? "No new briefs in your city right now. Toggle to All KSA to see more, or check back soon." : "No open requests match this filter right now. Check back soon."}
          cta="Refresh" onCta={() => { window.__rtbBrowseLoaded = false; setLoading(true); }} />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {shown.map(r => (
          <Card key={r.id} pad={18} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: r.tint, display: 'grid',
                placeItems: 'center', flexShrink: 0 }}>
                <i className={`ph ${r.icon}`} style={{ fontSize: 23, color: r.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink }}>{tr(r.cat)}</span>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>· {r.guests} {tr('guests')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 12.5,
                  color: C.fg3, marginTop: 2 }}>
                  <i className="ph ph-map-pin" style={{ fontSize: 14 }} />{r.city} · {r.date}
                </div>
              </div>
              <Badge tone={r.match >= 90 ? 'green' : 'purple'} icon="ph-fill ph-target">{r.match}%</Badge>
            </div>

            <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: C.fg2, margin: '13px 0 14px',
              flex: 1 }}>“{r.note}”</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <Pillbox icon="ph-wallet" label={`SAR ${r.budget}`} />
              <Pillbox icon="ph-users-three" label={`${r.guests}`} />
              <Pillbox icon="ph-clock" label={r.posted} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 13, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar seed={r.seed} size={28} initials={r.initials} />
                <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2 }}>
                  {r.name} {r.verified && <i className="ph-fill ph-seal-check" style={{ fontSize: 13,
                    color: C.emerald, verticalAlign: '-2px' }} />}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>· {r.offers} {tr('offers')}</span>
              </div>
              <Btn size="sm" icon="ph-paper-plane-right" onClick={() => go('submitProposal', r)}>{tr('Send quote')}</Btn>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

function Pillbox({ icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 12,
      fontWeight: 600, color: C.fg2, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: '5px 9px' }}>
      <i className={`ph ${icon}`} style={{ fontSize: 14, color: C.fg3 }} />{label}
    </span>
  );
}

/* ── Submit proposal (planner's quote against a request) ─────── */
function SubmitProposalView({ req, go }) {
  const r = req || OPEN_REQUESTS[0];
  const [price, setPrice] = React.useState(18000);
  const [pkg, setPkg] = React.useState('Signature');
  const fee = Math.round(price * 0.15);
  return (
    <div style={{ padding: 28 }}>
      <DetailHeader onBack={() => go('browse')} crumb="Open requests / Submit quote">
        <Btn variant="secondary" size="sm" icon="ph-chat-circle" onClick={() => go('messages')}>{tr('Ask a question')}</Btn>
      </DetailHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20 }}>
        {/* the request */}
        <Section title={tr('Client request')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Avatar seed={r.seed} size={48} initials={r.initials} />
            <div>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>{r.name}
                {r.verified && <i className="ph-fill ph-seal-check" style={{ fontSize: 15, color: C.emerald,
                  verticalAlign: '-2px', marginLeft: 5 }} />}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('Posted')} {r.posted} · {r.offers} {tr('offers so far')}</div>
            </div>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: C.fg2, margin: '0 0 16px' }}>“{r.note}”</p>
          <InfoRow icon={r.icon} label={tr('Event type')} value={tr(r.cat)} />
          <InfoRow icon="ph-calendar-blank" label={tr('Date')} value={trDate(r.date)} />
          <InfoRow icon="ph-users-three" label={tr('Guests')} value={r.guests} />
          <InfoRow icon="ph-map-pin" label={tr('City')} value={trCity(r.city)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.gold100, display: 'grid',
              placeItems: 'center', flexShrink: 0 }}>
              <i className="ph ph-wallet" style={{ fontSize: 17, color: C.gold600 }} />
            </div>
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{tr('Client budget')}</span>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>SAR {r.budget}</span>
          </div>
        </Section>

        {/* your proposal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title={tr('Your proposal')}>
            <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 9 }}>{tr('Package')}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {['Essentials', 'Signature', 'Luxury'].map(t => {
                const on = pkg === t;
                return <button key={t} onClick={() => setPkg(t)} style={{ all: 'unset', cursor: 'pointer', flex: 1,
                  textAlign: 'center', fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '10px 6px',
                  borderRadius: 12, border: `1.5px solid ${on ? C.brand : C.borderStrong}`,
                  background: on ? C.purple50 : C.surface, color: on ? C.brand : C.ink }}>{t}</button>;
              })}
            </div>

            <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 9 }}>
              Your quote · SAR {price.toLocaleString()}</div>
            <input type="range" min="6000" max="40000" step="500" value={price}
              onChange={e => setPrice(+e.target.value)} style={{ width: '100%', accentColor: C.brand, marginBottom: 6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 11,
              color: C.fg3, marginBottom: 18 }}><span>SAR 6,000</span><span>SAR 40,000</span></div>

            <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg2, marginBottom: 9 }}>{tr('Message to client')}</div>
            <div style={{ border: `1.5px solid ${C.borderStrong}`, borderRadius: 12, padding: '12px 14px',
              background: C.surface, fontFamily: SANS, fontSize: 13, color: C.fg2, lineHeight: 1.55, minHeight: 76 }}>
              Hi {r.name.split(' ')[0]}! We’d love to bring your {r.cat.toLowerCase()} to life. Our {pkg} package covers
              full planning, styling and coordination — tailored to your vision.
            </div>
          </Section>

          {/* payout preview */}
          <Card pad={18} style={{ background: 'linear-gradient(150deg,#5B2C83,#3A1B52)', border: 'none',
            position: 'relative', overflow: 'hidden' }}>
            <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
              style={{ position: 'absolute', right: -18, bottom: -22, width: 110, opacity: 0.18 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 13,
                color: 'rgba(255,255,255,0.85)', padding: '3px 0' }}>
                <span>{tr('Your quote')}</span><span>SAR {price.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 13,
                color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
                <span>{tr('Platform fee (15%)')}</span><span>− SAR {fee.toLocaleString()}</span></div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#fff' }}>{tr('You earn')}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.gold }}>SAR {(price - fee).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Btn icon="ph-paper-plane-right" onClick={() => { if (window.rtbPlToast) window.rtbPlToast({ tone: 'success', title: tr('Proposal sent'), sub: tr('The client will be notified of your quote.') }); go('leads'); }} style={{ width: '100%' }}>{tr('Send proposal')}</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrowseRequestsView, SubmitProposalView, OPEN_REQUESTS });
