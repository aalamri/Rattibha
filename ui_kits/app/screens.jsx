/* Rattibha app — screens. Uses globals from ui.jsx. */

function Header({ title, sub, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px 12px' }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0,
          border: `1.5px solid ${C.border}`, background: C.surface, display: 'grid', placeItems: 'center',
          cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18, color: C.ink }} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.05 }}>{tr(title)}</div>
        {sub && <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg2, marginTop: 2 }}>{tr(sub)}</div>}
      </div>
      {right}
    </div>
  );
}

function PlannerRow({ p, onOpen }) {
  return (
    <button onClick={() => onOpen(p)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
      <div style={{ display: 'flex', gap: 12, background: C.surface, borderRadius: 18,
        border: `1px solid ${C.border}`, boxShadow: '0 6px 18px -10px rgba(43,34,51,0.14)', padding: 10 }}>
        <Photo seed={p.seed} style={{ width: 92, height: 92, borderRadius: 13, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trPlanner(p, 'name')}</span>
            <Stars rating={p.rating} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.fg2, fontSize: 12.5,
            fontFamily: SANS, marginTop: 3 }}>
            <i className="ph ph-map-pin" style={{ fontSize: 14 }} />{trCity(p.city)} · {trPlanner(p, 'type')}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            {p.premium && <Badge bg={C.gold200} fg="#7a5a14" icon="ph-fill ph-crown-simple">{tr('Premium')}</Badge>}
            <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 12, color: C.fg3 }}>
              {isAR() ? 'من' : 'from'} <b style={{ color: C.ink, fontSize: 14 }}>SAR {p.from.toLocaleString()}</b>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function DiscoverScreen({ go, cat, setCat, city, setCity, lang, setLang }) {
  const [cityOpen, setCityOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(() => !window.__rtbDiscoverLoaded);
  React.useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => { window.__rtbDiscoverLoaded = true; setLoading(false); }, 1100);
    return () => clearTimeout(t);
  }, [loading]);
  const inCity = p => !city || city === 'All Saudi Arabia' || p.city === city;
  const featured = PLANNERS.filter(p => p.premium && inCity(p));
  const nearby = PLANNERS.filter(inCity);
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '6px 18px 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <img src="../../assets/logo-wordmark.png" alt="رتّبها" style={{ height: 26, width: 'auto', display: 'block' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setLang(isAR() ? 'en' : 'ar')} style={{ all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, height: 42, padding: '0 13px', borderRadius: 999,
              border: `1.5px solid ${C.border}`, background: C.surface, fontFamily: SANS, fontSize: 13, fontWeight: 700,
              color: C.ink }}>
              <i className="ph ph-translate" style={{ fontSize: 16, color: C.brand }} />{isAR() ? 'EN' : 'ع'}
            </button>
            <button onClick={() => go('notifications')} style={{ all: 'unset', cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: 42, height: 42, borderRadius: 999, border: `1.5px solid ${C.border}`,
                background: C.surface, display: 'grid', placeItems: 'center' }}>
                <i className="ph ph-bell" style={{ fontSize: 19, color: C.ink }} />
              </div>
              <span style={{ position: 'absolute', top: 8, [isAR() ? 'left' : 'right']: 9, width: 8, height: 8, borderRadius: 999,
                background: C.brand, border: '2px solid #fff' }} />
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg2 }}>{tr('Good evening 👋')}</div>
          <button onClick={() => setCityOpen(true)} style={{ all: 'unset', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 4, fontFamily: SANS, fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 1 }}>
            <i className="ph-fill ph-map-pin" style={{ color: C.brand, fontSize: 16 }} />{trCity(city || 'All Saudi Arabia')}
            <i className="ph ph-caret-down" style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>

      {loading ? <DiscoverSkeleton /> : (<React.Fragment>
      {/* hero */}
      <div style={{ margin: '8px 18px 4px', borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
        <Photo seed={0} style={{ height: 158 }}>
          <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
            style={{ position: 'absolute', top: -20, right: -10, width: 138, height: 'auto', opacity: 0.34,
              transform: 'rotate(-8deg)', pointerEvents: 'none' }} />
          <div style={{ background: 'linear-gradient(transparent,rgba(43,34,51,0.82))', padding: '34px 18px 16px',
            position: 'relative' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 27, fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
              {tr('Plan your perfect celebration')}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {tr('Post one request — planners come to you')}
            </div>
            <button onClick={() => go('postRequest', { city })} style={{ all: 'unset', cursor: 'pointer', marginTop: 13,
              display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.brand,
              fontFamily: SANS, fontSize: 13.5, fontWeight: 700, padding: '10px 16px', borderRadius: 12,
              boxShadow: '0 8px 18px -8px rgba(0,0,0,0.4)' }}>
              <i className="ph-fill ph-megaphone" style={{ fontSize: 17 }} />{tr('Post a request')}
            </button>
          </div>
        </Photo>
      </div>

      {/* search */}
      <div style={{ padding: '10px 18px 4px' }}>
        <button onClick={() => go('search')} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface,
          border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '12px 14px' }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: C.fg3 }} />
          <span style={{ fontFamily: SANS, fontSize: 14, color: C.fg3, flex: 1 }}>{tr('Search planners, venues…')}</span>
          <i className="ph ph-sliders-horizontal" style={{ fontSize: 18, color: C.brand }} />
        </div>
        </button>
      </div>

      {/* categories */}
      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '12px 18px 6px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => {
          const on = cat === c.key;
          return (
            <button key={c.key} onClick={() => setCat(on ? null : c.key)} style={{ all: 'unset', cursor: 'pointer',
              display: 'inline-flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap', fontFamily: SANS,
              fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 999,
              border: `1.5px solid ${on ? c.color : C.borderStrong}`,
              background: on ? c.tint : C.surface, color: on ? c.color : C.ink }}>
              <i className={`ph ${c.icon}`} style={{ fontSize: 16, color: c.color }} />{trCat(c.key, c.label)}
            </button>
          );
        })}
      </div>

      {/* featured */}
      <SectionTitle title={tr('Featured planners')} action={tr('See all')} />
      <div style={{ display: 'flex', gap: 13, overflowX: 'auto', padding: '4px 18px 8px', scrollbarWidth: 'none' }}>
        {featured.map(p => (
          <button key={p.id} onClick={() => go('planner', p)} style={{ all: 'unset', cursor: 'pointer' }}>
            <div style={{ width: 220, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`,
              boxShadow: '0 8px 22px -12px rgba(43,34,51,0.18)', overflow: 'hidden' }}>
              <Photo seed={p.seed} style={{ height: 116 }} label={p.premium ? '★ Premium' : null}>
                <span />
              </Photo>
              <div style={{ padding: '11px 13px 13px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trPlanner(p, 'name')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: C.fg2 }}>{trCity(p.city)} · {trPlanner(p, 'type')}</span>
                  <Stars rating={p.rating} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* list */}
      <SectionTitle title={city && city !== 'All Saudi Arabia' ? (isAR() ? `الأعلى تقييماً في ${trCity(city)}` : `Top rated in ${city}`) : tr('Top rated near you')} action={tr('Filters')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '4px 18px 0' }}>
        {nearby.map(p => <PlannerRow key={p.id} p={p} onOpen={pp => go('planner', pp)} />)}
        {nearby.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: C.fg3, fontFamily: SANS, fontSize: 13.5 }}>
            <i className="ph ph-map-pin-line" style={{ fontSize: 30, display: 'block', marginBottom: 8 }} />
            {isAR()
              ? <>لا يوجد منظّمون في {trCity(city)} بعد — <span onClick={() => go('postRequest', { city })} style={{ color: C.brand, fontWeight: 700 }}>انشر طلباً</span> وسيصلونك.</>
              : <>No planners in {city} yet — <span onClick={() => go('postRequest', { city })} style={{ color: C.brand, fontWeight: 700 }}>post a request</span> and they’ll come to you.</>}
          </div>
        )}
      </div>
      </React.Fragment>)}

      {cityOpen && <CitySheet current={city} onPick={c => { setCity(c); setCityOpen(false); }} onClose={() => setCityOpen(false)} />}
    </div>
  );
}

function CitySheet({ current, onPick, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(43,34,51,0.45)' }} />
      <div style={{ position: 'relative', background: C.cream, borderRadius: '24px 24px 0 0', padding: '14px 0 28px',
        maxHeight: '80%', display: 'flex', flexDirection: 'column', boxShadow: '0 -18px 44px -16px rgba(43,34,51,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.borderStrong, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 12px' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}>{tr('Choose your city')}</span>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer' }}>
            <i className="ph ph-x" style={{ fontSize: 20, color: C.fg2 }} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 22px 10px', background: C.surface,
          border: `1.5px solid ${C.borderStrong}`, borderRadius: 12, padding: '11px 13px' }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 17, color: C.fg3 }} />
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg3 }}>{tr('Search cities in Saudi Arabia…')}</span>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 14px' }}>
          {CITIES.map(c => {
            const on = (current || 'All Saudi Arabia') === c;
            const all = c === 'All Saudi Arabia';
            return (
              <button key={c} onClick={() => onPick(c)} style={{ all: 'unset', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                borderRadius: 12, background: on ? C.rose50 : 'transparent', marginBottom: 2 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: on ? C.brand : C.surface,
                  border: on ? 'none' : `1px solid ${C.border}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <i className={`ph${on ? '-fill' : ''} ${all ? 'ph-globe-hemisphere-east' : 'ph-map-pin'}`}
                    style={{ fontSize: 17, color: on ? '#fff' : C.fg3 }} />
                </div>
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: on ? 700 : 500,
                  color: on ? C.brand : C.ink }}>{trCity(c)}</span>
                {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 20, color: C.brand }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 18px 2px' }}>
      <span style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, color: C.ink }}>{title}</span>
      {action && <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.brand }}>{action}</span>}
    </div>
  );
}

function PlannerScreen({ p, go, back, fav, toggleFav, pkg, setPkg }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ position: 'relative' }}>
        <Photo seed={p.seed} style={{ height: 250 }} />
        <button onClick={back} style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.92)', display: 'grid',
          placeItems: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 19, color: C.ink }} />
        </button>
        <button onClick={toggleFav} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.92)', display: 'grid',
          placeItems: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
          <i className={fav ? 'ph-fill ph-heart' : 'ph ph-heart'} style={{ fontSize: 20, color: C.brand }} />
        </button>
      </div>

      <div style={{ background: C.cream, borderRadius: '24px 24px 0 0', marginTop: -22, position: 'relative',
        padding: '18px 18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 600, color: C.ink, lineHeight: 1.05 }}>{trPlanner(p, 'name')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.fg2, fontSize: 13.5,
              fontFamily: SANS, marginTop: 4 }}>
              <i className="ph ph-map-pin" style={{ fontSize: 15 }} />{trCity(p.city)} · {trPlanner(p, 'type')}
            </div>
          </div>
          <Stars rating={p.rating} />
        </div>

        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
          {p.premium && <Badge bg={C.gold200} fg="#7a5a14" icon="ph-fill ph-crown-simple">{tr('Premium')}</Badge>}
          {p.verified && <Badge bg={C.emerald100} fg="#1F7B4F" icon="ph-fill ph-seal-check">{tr('Verified')}</Badge>}
          <Badge bg={C.warm100} fg="#423B35">{isAR() ? `${p.events} مناسبة` : `${p.events} events`}</Badge>
        </div>

        <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: C.fg2, marginTop: 14 }}>{p.blurb}</p>

        {/* gallery */}
        <div style={{ display: 'flex', gap: 9, overflowX: 'auto', marginTop: 6, scrollbarWidth: 'none' }}>
          {[1,2,3,4].map(i => <Photo key={i} seed={p.seed + i} style={{ width: 108, height: 78,
            borderRadius: 12, flexShrink: 0 }} />)}
        </div>

        {/* services */}
        {p.services && p.services.length > 0 && (
          <>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink, marginTop: 22 }}>{tr('Services')}</div>
            <div style={{ display: 'flex', gap: 11, overflowX: 'auto', marginTop: 11, scrollbarWidth: 'none',
              paddingBottom: 2 }}>
              {p.services.map((sv, i) => (
                <div key={i} style={{ width: 152, flexShrink: 0, background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px -12px rgba(43,34,51,0.2)' }}>
                  <Photo seed={sv.seed} style={{ height: 92 }} />
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.25 }}>{sv.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3, marginTop: 3, lineHeight: 1.35,
                      height: 31, overflow: 'hidden' }}>{sv.desc}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.brand, marginTop: 6 }}>
                      From SAR {sv.from.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* packages */}
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink, marginTop: 22 }}>{tr('Packages')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {p.packages.map((pk, i) => {
            const on = pkg === i;
            return (
              <button key={i} onClick={() => setPkg(i)} style={{ all: 'unset', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface,
                  border: `1.5px solid ${on ? C.brand : C.border}`, borderRadius: 16, padding: '13px 15px',
                  boxShadow: on ? '0 8px 20px -12px rgba(75,0,130,0.5)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${on ? C.brand : C.borderStrong}`,
                    display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {on && <div style={{ width: 11, height: 11, borderRadius: 999, background: C.brand }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontWeight: 700, color: C.ink, fontSize: 15 }}>{pk.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{pk.note}</div>
                  </div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, color: C.brand, fontSize: 15 }}>
                    SAR {pk.price.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* reviews */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>{tr('Reviews')}</span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.brand }}>{isAR() ? `الكل ${p.events}` : `All ${p.events}`}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar seed={r.seed} size={36} initials={r.who[0]} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13.5, color: C.ink }}>{r.who}</div>
                  <div style={{ color: C.gold, fontSize: 12 }}>
                    {'★'.repeat(r.rating)}<span style={{ color: C.warm100 }}>{'★'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: C.fg2, margin: '9px 0 0' }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function PlannerFooter({ p, pkg, go }) {
  return (
    <div style={{ padding: '12px 18px 30px',
      background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)', display: 'flex', gap: 12,
      alignItems: 'center' }}>
      <button style={{ width: 50, height: 50, borderRadius: 14, border: `1.5px solid ${C.borderStrong}`,
        background: C.surface, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <i className="ph ph-chat-circle" style={{ fontSize: 21, color: C.ink }} />
      </button>
      <Btn full icon="ph-fill ph-paper-plane-tilt" onClick={() => go('request', { p, pkg })} style={{ flex: 1 }}>
        {tr('Request to book')}
      </Btn>
    </div>
  );
}

Object.assign(window, { Header, PlannerRow, DiscoverScreen, SectionTitle, PlannerScreen, PlannerFooter });
