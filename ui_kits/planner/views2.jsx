/* Rattibha Planner Dashboard — Messages (two-pane) + Profile/Storefront. */

function MessagesView() {
  const [active, setActive] = React.useState(0);
  const conv = MESSAGES[active];
  const thread = [
    { me: false, t: 'Hi! We just received your offer — it looks wonderful 💜' },
    { me: true, t: 'So glad you like it! The Signature package will suit your 220 guests perfectly.' },
    { me: false, t: 'Could we do soft rose & gold for the florals?' },
    { me: true, t: 'Absolutely — that’s one of our signature palettes. I’ll send a moodboard today.' },
    { me: false, t: 'Perfect, the moodboard looks beautiful! 💜' },
  ];
  return (
    <div style={{ padding: 28, height: '100%', boxSizing: 'border-box' }}>
      <Card pad={0} style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
        {/* list */}
        <div style={{ width: 290, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Messages')}</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {MESSAGES.map((m, i) => {
              const on = active === i;
              return (
                <button key={i} onClick={() => setActive(i)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                  <div style={{ display: 'flex', gap: 11, padding: '13px 18px', alignItems: 'center',
                    background: on ? C.purple50 : 'transparent', borderLeft: `3px solid ${on ? C.brand : 'transparent'}` }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar seed={m.seed} size={42} initials={m.initials} />
                      {m.online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11,
                        borderRadius: 999, background: C.emerald, border: `2px solid ${C.surface}` }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{m.who}</span>
                        <span style={{ fontFamily: SANS, fontSize: 11, color: C.fg3 }}>{m.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: m.unread ? C.ink : C.fg3,
                          fontWeight: m.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' }}>{m.last}</span>
                        {m.unread > 0 && <span style={{ background: C.brand, color: '#fff', fontSize: 10.5,
                          fontWeight: 700, minWidth: 18, height: 18, borderRadius: 999, display: 'grid',
                          placeItems: 'center', flexShrink: 0 }}>{m.unread}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 20px',
            borderBottom: `1px solid ${C.border}` }}>
            <Avatar seed={conv.seed} size={40} initials={conv.initials} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: C.ink }}>{conv.who}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.emerald }}>● Online</div>
            </div>
            <Btn variant="secondary" size="sm" icon="ph-calendar-plus">{tr('Create booking')}</Btn>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 10,
            background: C.bg }}>
            {thread.map((m, i) => (
              <div key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '70%',
                background: m.me ? C.brand : C.surface, color: m.me ? '#fff' : C.ink,
                border: m.me ? 'none' : `1px solid ${C.border}`,
                borderRadius: m.me ? '16px 16px 5px 16px' : '16px 16px 16px 5px', padding: '10px 14px',
                fontFamily: SANS, fontSize: 13.5, lineHeight: 1.45 }}>{m.t}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '14px 20px',
            borderTop: `1px solid ${C.border}` }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: C.bg,
              border: `1px solid ${C.border}`, borderRadius: 999, padding: '11px 16px' }}>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg3 }}>{tr('Write a reply…')}</span>
              <i className="ph ph-paperclip" style={{ fontSize: 17, color: C.fg3 }} />
            </div>
            <button style={{ width: 44, height: 44, borderRadius: 999, border: 'none', background: C.brand,
              display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <i className="ph-fill ph-paper-plane-right" style={{ fontSize: 19, color: '#fff' }} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Profile / Storefront ─────────────────────────────────────── */
function ProfileView({ go }) {
  return (
    <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Photo seed={0} style={{ height: 130 }}>
            <img src="../../assets/glyph-ra-light.png" alt="" aria-hidden="true"
              style={{ position: 'absolute', top: 10, right: 14, width: 92, opacity: 0.25 }} />
          </Photo>
          <div style={{ padding: '0 22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -34 }}>
              <div style={{ width: 88, height: 88, borderRadius: 22, background: GRADS[0], border: `4px solid ${C.surface}`,
                display: 'grid', placeItems: 'center', color: '#fff', fontFamily: DISPLAY, fontSize: 36, fontWeight: 700 }}>L</div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}>{PLANNER.name}</span>
                  <Badge tone="gold" icon="ph-fill ph-crown-simple">{tr('Premium')}</Badge>
                  <Badge tone="green" icon="ph-fill ph-seal-check">{tr('Verified')}</Badge>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.fg3, marginTop: 2 }}>{isAR() ? 'أعراس وحفلات · الرياض' : 'Weddings & Galas · Riyadh'}</div>
              </div>
              <Btn variant="secondary" size="sm" icon="ph-pencil-simple" onClick={() => go && go('profileEdit')}>{tr('Edit')}</Btn>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: C.fg2, margin: '16px 0 0' }}>
              Award-winning luxury wedding & gala studio crafting unforgettable celebrations across the Kingdom.
              240+ events delivered with a dedicated planning team.
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Services')}</div>
            <span onClick={() => go && go('profileEdit')} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand, cursor: 'pointer' }}>{tr('Manage')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[['Full Wedding Planning', '18,000', 0], ['Luxury Gala Production', '42,000', 5], ['Engagement & Milkah', '12,000', 3]].map(([name, from, seed]) => (
              <div key={name} style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <Photo seed={seed} style={{ height: 84 }} />
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.25 }}>{name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.brand, marginTop: 4 }}>{tr('From')} SAR {from}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Portfolio')}</div>
            <span onClick={() => go && go('profileEdit')} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.brand, cursor: 'pointer' }}>{tr('Manage')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[1,2,3,4,5,6,7,8].map(i => <Photo key={i} seed={i} style={{ height: 80, borderRadius: 12 }} />)}
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 14 }}>{tr('Performance')}</div>
          {[[tr('Profile views'), '2,480', 'ph-eye'], [tr('Response rate'), '98%', 'ph-lightning'],
            [tr('Avg. response'), '12 min', 'ph-clock'], [tr('Booking rate'), '34%', 'ph-chart-line-up']].map(([l, v, ic]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0',
              borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.purple50, display: 'grid', placeItems: 'center' }}>
                <i className={`ph ${ic}`} style={{ fontSize: 17, color: C.brand }} />
              </div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: C.fg2 }}>{l}</span>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>{v}</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{tr('Rating')}</div>
            <Badge tone="gold" icon="ph-fill ph-star">{PLANNER.rating}</Badge>
          </div>
          {[[5, 86], [4, 11], [3, 2], [2, 1], [1, 0]].map(([s, pct]) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.fg3, width: 10 }}>{s}</span>
              <i className="ph-fill ph-star" style={{ fontSize: 12, color: C.gold }} />
              <div style={{ flex: 1, height: 7, borderRadius: 999, background: C.purple50, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: C.gold }} />
              </div>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.fg3, width: 30, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
          <div style={{ fontFamily: SANS, fontSize: 12, color: C.fg3, marginTop: 8 }}>{PLANNER.reviews} reviews</div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { MessagesView, ProfileView });
