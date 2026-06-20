/* Rattibha Planner Dashboard — Shell (sidebar + topbar) and Overview view. */

function Sidebar({ active, go }) {
  return (
    <div style={{ width: 252, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`,
      height: '100%', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 22px' }}>
        <img src="../../assets/logo-wordmark.png" alt="رتّبها" style={{ height: 26 }} />
        <Badge tone="gold" icon="ph-fill ph-crown-simple">{tr('Pro')}</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(n => {
          const on = active === n.key;
          return (
            <button key={n.key} onClick={() => go(n.key)} style={{ all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12,
              background: on ? C.purple50 : 'transparent', color: on ? C.brand : C.fg2,
              fontFamily: SANS, fontSize: 14, fontWeight: on ? 600 : 500 }}>
              <i className={`${on ? 'ph-fill' : 'ph'} ${n.icon}`} style={{ fontSize: 20 }} />
              <span style={{ flex: 1 }}>{tr(n.label)}</span>
              {n.badge && <span style={{ background: on ? C.brand : C.lavender100, color: on ? '#fff' : C.brand,
                fontSize: 11, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 999, display: 'grid',
                placeItems: 'center', padding: '0 5px' }}>{n.badge}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ background: 'linear-gradient(150deg,#5B2C83,#3A1B52)', borderRadius: 16, padding: 16,
          position: 'relative', overflow: 'hidden' }}>
          <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
            style={{ position: 'absolute', right: -18, bottom: -20, width: 96, opacity: 0.22 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: '#fff' }}>{tr('Boost your reach')}</div>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 11px',
              lineHeight: 1.45 }}>{tr('Feature your studio to 3× more clients.')}</p>
            <Btn size="sm" variant="gold" icon="ph-rocket-launch">{tr('Upgrade')}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ title, sub, lang, setLang }) {
  return (
    <div style={{ height: 72, flexShrink: 0, borderBottom: `1px solid ${C.border}`, background: C.surface,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 11, padding: '9px 13px', width: 200 }}>
        <i className="ph ph-magnifying-glass" style={{ fontSize: 17, color: C.fg3 }} />
        <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.fg3 }}>{tr('Search…')}</span>
      </div>
      <button onClick={() => setLang && setLang(lang === 'ar' ? 'en' : 'ar')} style={{ all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 14px', borderRadius: 11,
        border: `1px solid ${C.border}`, fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: C.ink }}>
        <i className="ph ph-globe" style={{ fontSize: 17 }} />{lang === 'ar' ? 'EN' : 'العربية'}
      </button>
      <button style={{ all: 'unset', cursor: 'pointer', position: 'relative', width: 42, height: 42, borderRadius: 12,
        border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}>
        <i className="ph ph-bell" style={{ fontSize: 19, color: C.ink }} />
        <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999,
          background: C.danger, border: `2px solid ${C.surface}` }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
        <Avatar seed={PLANNER.seed} size={40} initials={PLANNER.initials} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{PLANNER.name}</div>
          <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{trCity(PLANNER.city)}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────── */
function OverviewView({ go }) {
  const kpis = [
    { label: 'New leads', value: '4', delta: '+2 today', icon: 'ph-tray-arrow-down', tone: 'purple', up: true },
    { label: 'Active bookings', value: '12', delta: '+3 this month', icon: 'ph-calendar-check', tone: 'lav', up: true },
    { label: 'Revenue (Mar)', value: 'SAR 84k', delta: '+18%', icon: 'ph-trend-up', tone: 'green', up: true },
    { label: 'Avg. rating', value: '4.9', delta: '168 reviews', icon: 'ph-star', tone: 'gold' },
  ];
  // bar chart data
  const bars = [42, 55, 38, 61, 72, 58, 84];
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const maxB = Math.max(...bars);
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {kpis.map(k => {
          const tones = { purple: [C.purple50, C.brand], lav: [C.lavender100, '#6F539C'],
            green: [C.emerald100, C.emerald], gold: [C.gold100, C.gold600] }[k.tone];
          return (
            <Card key={k.label} pad={18}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: tones[0], display: 'grid',
                  placeItems: 'center' }}>
                  <i className={`ph-fill ${k.icon}`} style={{ fontSize: 20, color: tones[1] }} />
                </div>
                {k.up && <Badge tone="green" icon="ph-bold ph-arrow-up">{tr(k.delta)}</Badge>}
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 14 }}>{k.value}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg2, marginTop: 1 }}>{tr(k.label)}</div>
              {!k.up && <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3, marginTop: 3 }}>{tr(k.delta)}</div>}
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* revenue chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Revenue')}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{tr('Last 7 months')}</div>
            </div>
            <Badge tone="gray">SAR</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, padding: '0 4px' }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  height: 150 }}>
                  <div style={{ height: `${(b / maxB) * 100}%`, borderRadius: '8px 8px 4px 4px',
                    background: i === bars.length - 1 ? 'linear-gradient(180deg,#7B4FB0,#5B2C83)' : C.purple100,
                    position: 'relative' }}>
                    {i === bars.length - 1 && <span style={{ position: 'absolute', top: -22, left: '50%',
                      transform: 'translateX(-50%)', fontFamily: SANS, fontSize: 11.5, fontWeight: 700,
                      color: C.brand, whiteSpace: 'nowrap' }}>SAR {b}k</span>}
                  </div>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3 }}>{trMonth(months[i])}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* activity */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Recent activity')}</div>
            <i className="ph ph-dots-three" style={{ fontSize: 18, color: C.fg3 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ACTIVITY.map((a, i) => {
              const tones = { purple: [C.purple50, C.brand], green: [C.emerald100, C.emerald],
                gold: [C.gold100, C.gold600], lav: [C.lavender100, '#6F539C'] }[a.tone];
              return (
                <div key={i} style={{ display: 'flex', gap: 11, padding: '9px 0',
                  borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: tones[0], display: 'grid',
                    placeItems: 'center', flexShrink: 0 }}>
                    <i className={`ph-fill ${a.icon}`} style={{ fontSize: 17, color: tones[1] }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{tr(a.t)}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3, marginTop: 1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr(a.d)}</div>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: C.fg3, flexShrink: 0 }}>{a.time}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* recent leads + upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card pad={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('New open requests')}</div>
            <span onClick={() => go('browse')} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand,
              cursor: 'pointer' }}>{tr('View all →')}</span>
          </div>
          {OPEN_REQUESTS.slice(0, 3).map((l, i) => (
            <div key={l.id} onClick={() => go('submitProposal', l)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
              borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <Avatar seed={l.seed} size={38} initials={l.initials} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{tr(l.cat)} · {l.guests} {tr('guests')}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{l.name} · {trCity(l.city)}</div>
              </div>
              <Badge tone="purple" icon="ph-fill ph-target">{l.match}%</Badge>
            </div>
          ))}
        </Card>

        <Card pad={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px' }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Upcoming events')}</div>
            <span onClick={() => go('bookings')} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand,
              cursor: 'pointer' }}>{tr('View all →')}</span>
          </div>
          {BOOKINGS.filter(b => b.status === 'confirmed').slice(0, 3).map(b => {
            const [d, m] = b.date.split(' ');
            return (
              <div key={b.id} onClick={() => go('bookingDetail', b)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: C.purple50, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: C.brand, lineHeight: 1 }}>{trNum(d)}</span>
                  <span style={{ fontFamily: SANS, fontSize: 10, color: C.brand, textTransform: 'uppercase' }}>{trMonth(m)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{b.client}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3 }}>{b.pkg}</div>
                </div>
                <Badge tone="lav">{tr(b.stage)}</Badge>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, OverviewView });
