/* Rattibha Planner Dashboard — polish states: skeletons, empty states, toasts.
   Bilingual via tr() from lang.jsx. Uses C, SANS, DISPLAY, Card from dash.jsx. */

(function injectPlannerAnims(){
  if (typeof document === 'undefined' || document.getElementById('rtb-pl-anim')) return;
  const s = document.createElement('style'); s.id = 'rtb-pl-anim';
  s.textContent = '@keyframes rtbShim{0%{background-position:-400px 0}100%{background-position:400px 0}}'
    + '@keyframes rtbSpin{to{transform:rotate(360deg)}}'
    + '@keyframes rtbToastIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}';
  document.head.appendChild(s);
})();
const _pt = (s) => (typeof tr === 'function' ? tr(s) : s);

function PSkel({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0,
      background: `linear-gradient(90deg, ${C.warm100||'#ECE6DE'} 25%, ${C.bg||'#F4F0EA'} 37%, ${C.warm100||'#ECE6DE'} 63%)`,
      backgroundSize: '800px 100%', animation: 'rtbShim 1.4s ease-in-out infinite', ...style }} />
  );
}

/* request-board card skeleton (2-col grid item) */
function RequestCardSkeleton() {
  return (
    <Card pad={18}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <PSkel w={46} h={46} r={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PSkel w="55%" h={18} /><PSkel w="40%" h={12} />
        </div>
        <PSkel w={56} h={26} r={999} />
      </div>
      <PSkel w="100%" h={13} style={{ marginTop: 16 }} />
      <PSkel w="80%" h={13} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <PSkel w={90} h={28} r={8} /><PSkel w={60} h={28} r={8} /><PSkel w={70} h={28} r={8} />
      </div>
    </Card>
  );
}

function BrowseSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <RequestCardSkeleton /><RequestCardSkeleton />
      <RequestCardSkeleton /><RequestCardSkeleton />
    </div>
  );
}

/* table-row skeleton (overview / bookings) */
function RowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
      borderTop: `1px solid ${C.border}` }}>
      <PSkel w={38} h={38} r={999} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <PSkel w="40%" h={14} /><PSkel w="28%" h={11} />
      </div>
      <PSkel w={64} h={24} r={999} />
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */
function PEmpty({ icon = 'ph-tray', title, body, cta, onCta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '72px 36px', gap: 6 }}>
      <div style={{ width: 92, height: 92, borderRadius: 26, background: C.purple50 || '#F2EAF7',
        display: 'grid', placeItems: 'center', marginBottom: 14 }}>
        <i className={`ph ${icon}`} style={{ fontSize: 44, color: C.brand }} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink }}>{_pt(title)}</div>
      {body && <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: C.fg3, maxWidth: 420,
        margin: '6px 0 0' }}>{_pt(body)}</p>}
      {cta && (
        <button onClick={onCta} style={{ all: 'unset', cursor: 'pointer', marginTop: 22, fontFamily: SANS,
          fontWeight: 700, fontSize: 15, color: '#fff', background: C.brand, borderRadius: 14,
          padding: '13px 26px', boxShadow: '0 12px 26px -12px rgba(75,0,130,0.5)',
          display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          <i className="ph-fill ph-arrows-clockwise" style={{ fontSize: 18 }} />{_pt(cta)}
        </button>
      )}
    </div>
  );
}

/* ── Toast host (window.rtbPlToast) ─────────────────────────── */
function PToastHost() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    window.rtbPlToast = (opts) => {
      const id = Date.now() + Math.random();
      setItems(x => [...x, { id, ...opts }]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== id)), opts.duration || 3400);
    };
    return () => { delete window.rtbPlToast; };
  }, []);
  const tones = {
    success: { bg: C.emerald, i: 'ph-fill ph-check-circle' },
    info: { bg: C.brand, i: 'ph-fill ph-info' },
    warning: { bg: '#C9871F', i: 'ph-fill ph-warning' },
  };
  return (
    <div style={{ position: 'fixed', right: 28, bottom: 28, zIndex: 200, display: 'flex',
      flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
      {items.map(it => {
        const v = tones[it.tone] || tones.success;
        return (
          <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', minWidth: 300,
            boxShadow: '0 20px 44px -18px rgba(43,34,51,0.4)', animation: 'rtbToastIn .3s cubic-bezier(.22,1,.36,1) both' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: v.bg, display: 'grid',
              placeItems: 'center', flexShrink: 0 }}>
              <i className={v.i} style={{ fontSize: 21, color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{_pt(it.title)}</div>
              {it.sub && <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{_pt(it.sub)}</div>}
            </div>
            <i className="ph ph-x" onClick={() => setItems(x => x.filter(i => i.id !== it.id))}
              style={{ fontSize: 18, color: C.fg3, cursor: 'pointer' }} />
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { PSkel, RequestCardSkeleton, BrowseSkeleton, RowSkeleton, PEmpty, PToastHost });
