/* Rattibha app — reverse-marketplace flow (set 6, Upwork-style):
   Post a request (broadcast by service) → receive multiple planner proposals → compare → pick one.
   Uses globals (C, SANS, DISPLAY, Btn, Photo, Badge, Stars, Avatar, Header, Field, InputBox, CATEGORIES, CITIES, PLANNERS). */

// shared draft of the in-progress request (so the separately-rendered footer can read the chosen city/category)
const __draftReq = { city: 'Riyadh', cat: 'weddings' };

/* ── Post a request (broadcast) ─────────────────────────────── */
function PostRequestScreen({ data, go, back }) {
  const [cat, setCat] = React.useState((data && data.cat) || 'weddings');
  const [guests, setGuests] = React.useState(150);
  const [budget, setBudget] = React.useState(1);
  const [city, setCity] = React.useState((data && data.city && data.city !== 'All Saudi Arabia' && data.city) || 'Riyadh');
  React.useEffect(() => { __draftReq.city = city; }, [city]);
  React.useEffect(() => { __draftReq.cat = cat; }, [cat]);
  const [cityOpen, setCityOpen] = React.useState(false);
  const budgets = ['< 10k', '10–20k', '20–35k', '35k+'];
  const pickCities = CITIES.filter(c => c !== 'All Saudi Arabia');
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Post a request" sub="Planners send you quotes" onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.rose50, borderRadius: 14,
          padding: '12px 14px' }}>
          <i className="ph-fill ph-megaphone" style={{ fontSize: 19, color: C.brand }} />
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.brand, lineHeight: 1.45 }}>
            {isAR() ? 'صِف مناسبتك مرة واحدة — المنظّمون الموثّقون يتنافسون بعروض مخصّصة. مجانًا دون التزام.'
              : 'Describe your event once — verified planners compete with tailored quotes. Free, no commitment.'}</span>
        </div>

        <Field label={tr('What are you planning?')}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {CATEGORIES.map(c => {
              const on = cat === c.key;
              return (
                <button key={c.key} onClick={() => setCat(c.key)} style={{ all: 'unset', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14,
                    border: `1.5px solid ${on ? C.brand : C.border}`, background: on ? C.rose50 : C.surface }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: c.tint, display: 'grid',
                      placeItems: 'center', flexShrink: 0 }}>
                      <i className={`ph ${c.icon}`} style={{ fontSize: 19, color: c.color }} />
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{trCat(c.key, c.label)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={tr('Event date')} style={{ flex: 1 }}><InputBox icon="ph-calendar-blank" value="14 Mar 2026" /></Field>
          <Field label={tr('City')} style={{ flex: 1 }}>
            <button onClick={() => setCityOpen(o => !o)} style={{ all: 'unset', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 9, background: C.surface, border: `1.5px solid ${cityOpen ? C.brand : C.borderStrong}`,
              borderRadius: 14, padding: '12px 14px', width: '100%', boxSizing: 'border-box' }}>
              <i className="ph ph-map-pin" style={{ fontSize: 17, color: cityOpen ? C.brand : C.fg3 }} />
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{trCity(city)}</span>
              <i className={`ph ph-caret-${cityOpen ? 'up' : 'down'}`} style={{ fontSize: 13, color: C.fg3 }} />
            </button>
          </Field>
        </div>
        {cityOpen && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: -8 }}>
            {pickCities.map(c => {
              const on = city === c;
              return <button key={c} onClick={() => { setCity(c); setCityOpen(false); }} style={{ all: 'unset',
                cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 13px', borderRadius: 999,
                border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
                color: on ? C.brand : C.ink }}>{c}</button>;
            })}
          </div>
        )}

        <Field label={`${isAR() ? 'الضيوف' : 'Guests'} · ${guests}`}>
          <input type="range" min="20" max="600" value={guests} onChange={e => setGuests(+e.target.value)}
            style={{ width: '100%', accentColor: C.brand }} />
        </Field>

        <Field label={tr('Budget range')}>
          <div style={{ display: 'flex', gap: 8 }}>
            {budgets.map((b, i) => {
              const on = i === budget;
              return <button key={b} onClick={() => setBudget(i)} style={{ all: 'unset', cursor: 'pointer', flex: 1,
                textAlign: 'center', fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '9px 6px',
                borderRadius: 12, border: `1.5px solid ${on ? C.brand : C.borderStrong}`,
                background: on ? C.rose50 : C.surface, color: on ? C.brand : C.ink }}>{b}</button>;
            })}
          </div>
        </Field>

        <Field label={tr('Describe your vision')}>
          <div style={{ border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '12px 14px',
            background: C.surface, fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.5, minHeight: 80 }}>
            Elegant garden wedding in soft rose &amp; gold. Looking for full planning, styling, catering and florals.
          </div>
        </Field>
      </div>
    </div>
  );
}
function PostRequestFooter({ go }) {
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-megaphone" onClick={() => go('requestSent', { broadcast: true, city: __draftReq.city, cat: __draftReq.cat })}>{tr('Post to planners')}</Btn>
    </div>
  );
}

/* ── Proposals inbox (competing quotes) ─────────────────────── */
function ProposalsScreen({ data, go, back }) {
  const reqCity = (data && data.city) || 'Riyadh';
  // only planners in the SAME city respond
  const cityPlanners = PLANNERS.filter(p => p.city === reqCity);
  const pitches = [
    { price: 18000, days: '2h ago', pitch: 'We’d love to craft your celebration — full planning included.', shortlisted: true },
    { price: 21500, days: '4h ago', pitch: 'Premium production team with in-house florals and lighting.' },
    { price: 15200, days: '6h ago', pitch: 'Intimate, romantic styling tailored to your budget.' },
    { price: 13800, days: '8h ago', pitch: 'Creative, colourful styling with great value packages.' },
  ];
  const proposals = cityPlanners.map((p, i) => ({ p, ...pitches[i % pitches.length], shortlisted: i === 0 }));
  const [sort, setSort] = React.useState('best');
  return (
    <div style={{ paddingBottom: 30 }}>
      <Header title="Offers for your event" sub={proposals.length ? (isAR() ? `${proposals.length} منظّم في ${trCity(reqCity)} ردّوا` : `${proposals.length} planners in ${reqCity} responded`) : (isAR() ? `لا يوجد منظّمون في ${trCity(reqCity)} بعد` : `No planners in ${reqCity} yet`)} onBack={back} />
      <div style={{ padding: '0 18px' }}>
        {/* request brief recap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 13, marginBottom: 14, boxShadow: '0 6px 16px -12px rgba(43,34,51,0.18)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.rose50, display: 'grid', placeItems: 'center' }}>
            <i className="ph-fill ph-heart-straight" style={{ fontSize: 20, color: C.brand }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: C.ink }}>Wedding · 150 guests</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}><i className="ph-fill ph-map-pin" style={{ fontSize: 12, color: C.brand, verticalAlign: '-1px' }} /> {reqCity} · 14 Mar 2026 · Budget SAR 10–20k</div>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.brand }}>Edit</span>
        </div>

        {/* sort */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['best', tr('Best match')], ['price', tr('Lowest price')], ['rating', tr('Top rated')]].map(([k, label]) => {
            const on = sort === k;
            return <button key={k} onClick={() => setSort(k)} style={{ all: 'unset', cursor: 'pointer',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 999,
              border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
              color: on ? C.brand : C.fg2 }}>{label}</button>;
          })}
        </div>

        {/* proposal cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {proposals.map((pr, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${pr.shortlisted ? C.brand : C.border}`,
              borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 22px -16px rgba(43,34,51,0.22)' }}>
              {pr.shortlisted && (
                <div style={{ background: C.rose50, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ph-fill ph-sparkle" style={{ fontSize: 13, color: C.brand }} />
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.brand }}>{isAR() ? 'الأنسب لك' : 'BEST MATCH FOR YOU'}</span>
                </div>
              )}
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Photo seed={pr.p.seed} style={{ width: 54, height: 54, borderRadius: 13, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink }}>{pr.p.name}</span>
                      <Stars rating={pr.p.rating} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 12,
                      color: C.fg3, marginTop: 2 }}>
                      <i className="ph ph-map-pin" style={{ fontSize: 13 }} />{pr.p.city} · replied {pr.days}
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: C.fg2, margin: '11px 0 13px' }}>“{pr.pitch}”</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: C.fg3 }}>{tr('Their quote')}</div>
                    <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: C.ink }}>SAR {pr.price.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="secondary" size="sm" icon="ph-chat-circle" onClick={() => go('chat', pr.p)}>{tr('Chat')}</Btn>
                    <Btn size="sm" icon="ph-arrow-right" onClick={() => go('offer', { p: pr.p, pkg: 0 })}>{tr('View offer')}</Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 4px', fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>
          <i className="ph ph-clock" style={{ fontSize: 14, verticalAlign: '-2px' }} /> {tr('More planners may still respond')}
        </div>
      </div>
    </div>
  );
}

/* ── My Requests tab ────────────────────────────────────────── */
function RequestsScreen({ go }) {
  const requests = [
    { id: 'r1', cat: 'Weddings', icon: 'ph-heart-straight', tint: '#F2EAF7', color: '#4B0082',
      title: 'Wedding · 150 guests', meta: 'Riyadh · 14 Mar 2026', budget: '10–20k',
      status: 'open', offers: 3, newOffers: 2, posted: '2h ago' },
    { id: 'r2', cat: 'Corporate', icon: 'ph-briefcase', tint: '#E4D4EF', color: '#3D0069',
      title: 'Annual gala · 300 guests', meta: 'Riyadh · 02 May 2026', budget: '35k+',
      status: 'open', offers: 5, newOffers: 0, posted: '1d ago' },
    { id: 'r3', cat: 'Birthdays', icon: 'ph-cake', tint: '#F6E7C4', color: '#B5881A',
      title: 'Birthday party · 40 guests', meta: 'Jeddah · 20 Jun 2026', budget: '< 10k',
      status: 'booked', offers: 4, newOffers: 0, posted: '5d ago' },
  ];
  const [filter, setFilter] = React.useState('all');
  const shown = requests.filter(r => filter === 'all' || r.status === filter);
  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="My requests" right={
        <button onClick={() => go('postRequest')} style={{ all: 'unset', cursor: 'pointer', width: 40, height: 40,
          borderRadius: 999, background: C.brand, display: 'grid', placeItems: 'center',
          boxShadow: '0 8px 16px -8px rgba(91,44,131,0.6)' }}>
          <i className="ph-bold ph-plus" style={{ fontSize: 19, color: '#fff' }} />
        </button>
      } />
      <div style={{ padding: '0 18px' }}>
        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['all', 'All'], ['open', 'Open'], ['booked', 'Booked']].map(([k, label]) => {
            const on = filter === k;
            return <button key={k} onClick={() => setFilter(k)} style={{ all: 'unset', cursor: 'pointer',
              fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 15px', borderRadius: 999,
              border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
              color: on ? C.brand : C.fg2 }}>{label}</button>;
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {shown.map(r => {
            const booked = r.status === 'booked';
            return (
              <button key={r.id} onClick={() => go('proposals', { req: r })} style={{ all: 'unset', cursor: 'pointer' }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 15,
                  boxShadow: '0 8px 22px -16px rgba(43,34,51,0.2)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: r.tint, display: 'grid',
                      placeItems: 'center', flexShrink: 0 }}>
                      <i className={`ph ${r.icon}`} style={{ fontSize: 23, color: r.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{r.title}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3, marginTop: 2 }}>{r.meta} · SAR {r.budget}</div>
                    </div>
                    {booked
                      ? <Badge bg={C.emerald100} fg={C.emerald} icon="ph-fill ph-seal-check">Booked</Badge>
                      : <Badge bg={C.rose50} fg={C.brand} icon="ph-fill ph-circle">Open</Badge>}
                  </div>

                  <div style={{ height: 1, background: C.border, margin: '13px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* stacked planner avatars */}
                      <div style={{ display: 'flex' }}>
                        {[r.color, '#7B4FB0', '#B5881A'].slice(0, Math.min(3, r.offers)).map((c, i) => (
                          <div key={i} style={{ width: 26, height: 26, borderRadius: 999, background: c,
                            border: '2px solid #fff', marginLeft: i ? -9 : 0 }} />
                        ))}
                      </div>
                      <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg2 }}>
                        <b style={{ color: C.ink }}>{r.offers}</b> {booked ? 'offers received' : 'offers'}
                      </span>
                    </div>
                    {booked
                      ? <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.fg3 }}>View booking →</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS,
                          fontSize: 12.5, fontWeight: 700, color: C.brand }}>
                          {r.newOffers > 0 && <span style={{ background: C.brand, color: '#fff', fontSize: 10,
                            fontWeight: 800, borderRadius: 999, padding: '1px 7px' }}>{r.newOffers} new</span>}
                          Compare →
                        </span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* empty hint / post CTA */}
        <button onClick={() => go('postRequest')} style={{ all: 'unset', cursor: 'pointer', display: 'block',
          width: '100%', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            border: `1.5px dashed ${C.borderStrong}`, borderRadius: 16, padding: '15px', background: C.rose50 }}>
            <i className="ph-fill ph-megaphone" style={{ fontSize: 19, color: C.brand }} />
            <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: C.brand }}>Post a new request</span>
          </div>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PostRequestScreen, PostRequestFooter, ProposalsScreen, RequestsScreen });
