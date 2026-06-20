/* Rattibha app — polish states: skeletons, empty states, toasts, inline loaders.
   Bilingual (uses tr/isAR if present). Exposes globals for use across screens. */

const _shimmer = `@keyframes rtbShimmer{0%{background-position:-360px 0}100%{background-position:360px 0}}`;
(function injectShimmer(){
  if (typeof document === 'undefined' || document.getElementById('rtb-shimmer')) return;
  const s = document.createElement('style'); s.id = 'rtb-shimmer'; s.textContent = _shimmer;
  document.head.appendChild(s);
})();
const _t = (s) => (typeof tr === 'function' ? tr(s) : s);

/* ── Skeleton primitive ─────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0,
      background: `linear-gradient(90deg, ${C.warm100} 25%, ${C.warm50} 37%, ${C.warm100} 63%)`,
      backgroundSize: '720px 100%', animation: 'rtbShimmer 1.4s ease-in-out infinite', ...style }} />
  );
}

/* Planner-row skeleton (matches PlannerRow layout) */
function PlannerRowSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 12, background: C.surface, borderRadius: 18,
      border: `1px solid ${C.border}`, padding: 10 }}>
      <Skel w={92} h={92} r={13} />
      <div style={{ flex: 1, paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Skel w="62%" h={18} />
        <Skel w="44%" h={13} />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Skel w={84} h={22} r={999} />
          <Skel w={70} h={22} r={999} style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </div>
  );
}

/* Featured-card skeleton (horizontal) */
function FeaturedCardSkeleton() {
  return (
    <div style={{ width: 220, flexShrink: 0, background: C.surface, borderRadius: 18,
      border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <Skel w="100%" h={116} r={0} />
      <div style={{ padding: '11px 13px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skel w="70%" h={17} />
        <Skel w="50%" h={12} />
      </div>
    </div>
  );
}

/* A full Discover loading state */
function DiscoverSkeleton() {
  return (
    <div style={{ padding: '4px 18px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Skel w="100%" h={158} r={22} />
      <Skel w="100%" h={48} r={14} />
      <div style={{ display: 'flex', gap: 13 }}>
        <FeaturedCardSkeleton /><FeaturedCardSkeleton />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <PlannerRowSkeleton /><PlannerRowSkeleton /><PlannerRowSkeleton />
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */
function EmptyState({ icon = 'ph-magnifying-glass', title, body, cta, onCta, compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: compact ? '36px 28px' : '64px 36px', gap: 6 }}>
      <div style={{ width: 84, height: 84, borderRadius: 24, background: C.rose50, display: 'grid',
        placeItems: 'center', marginBottom: 12, position: 'relative' }}>
        <i className={`ph ${icon}`} style={{ fontSize: 40, color: C.brand }} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}>{_t(title)}</div>
      {body && <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: C.fg3, maxWidth: 280,
        margin: '4px 0 0' }}>{_t(body)}</p>}
      {cta && (
        <button onClick={onCta} style={{ all: 'unset', cursor: 'pointer', marginTop: 18, fontFamily: SANS,
          fontWeight: 700, fontSize: 14, color: '#fff', background: C.brand, borderRadius: 13,
          padding: '12px 22px', boxShadow: '0 10px 22px -10px rgba(75,0,130,0.5)',
          display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="ph-fill ph-megaphone" style={{ fontSize: 17 }} />{_t(cta)}
        </button>
      )}
    </div>
  );
}

/* ── Toast ──────────────────────────────────────────────────── */
function Toast({ tone = 'success', icon, title, sub, onClose }) {
  const tones = {
    success: { bg: C.emerald, fg: '#fff', i: 'ph-fill ph-check-circle' },
    info: { bg: C.brand, fg: '#fff', i: 'ph-fill ph-info' },
    warning: { bg: '#C9871F', fg: '#fff', i: 'ph-fill ph-warning' },
    error: { bg: '#C24436', fg: '#fff', i: 'ph-fill ph-x-circle' },
  };
  const v = tones[tone] || tones.success;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: 16, padding: '13px 15px',
      boxShadow: '0 16px 36px -16px rgba(43,34,51,0.34)', minWidth: 280 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: v.bg, display: 'grid',
        placeItems: 'center', flexShrink: 0 }}>
        <i className={icon || v.i} style={{ fontSize: 20, color: v.fg }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>{_t(title)}</div>
        {sub && <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3, marginTop: 1 }}>{_t(sub)}</div>}
      </div>
      {onClose && <i className="ph ph-x" onClick={onClose} style={{ fontSize: 18, color: C.fg3, cursor: 'pointer' }} />}
    </div>
  );
}

/* ── Inline spinner ─────────────────────────────────────────── */
function Spinner({ size = 22, color = C.brand }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0,
      border: `${Math.max(2, size * 0.12)}px solid ${C.rose100}`, borderTopColor: color,
      animation: 'rtbSpin 0.7s linear infinite' }} />
  );
}
(function injectSpin(){
  if (typeof document === 'undefined' || document.getElementById('rtb-spin')) return;
  const s = document.createElement('style'); s.id = 'rtb-spin';
  s.textContent = '@keyframes rtbSpin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

Object.assign(window, { Skel, PlannerRowSkeleton, FeaturedCardSkeleton, DiscoverSkeleton,
  EmptyState, Toast, Spinner });

/* ── Imperative toast host (window.rtbToast) ────────────────── */
function ToastHost() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    window.rtbToast = (opts) => {
      const id = Date.now() + Math.random();
      setItems(x => [...x, { id, ...opts }]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== id)), opts.duration || 3200);
    };
    return () => { delete window.rtbToast; };
  }, []);
  return (
    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 96, zIndex: 80, display: 'flex',
      flexDirection: 'column', gap: 10, alignItems: 'center', pointerEvents: 'none' }}>
      {items.map(it => (
        <div key={it.id} style={{ pointerEvents: 'auto', width: '100%', animation: 'rtbToastIn .3s cubic-bezier(.22,1,.36,1) both' }}>
          <Toast tone={it.tone} icon={it.icon} title={it.title} sub={it.sub}
            onClose={() => setItems(x => x.filter(i => i.id !== it.id))} />
        </div>
      ))}
    </div>
  );
}
(function injectToastAnim(){
  if (typeof document === 'undefined' || document.getElementById('rtb-toast')) return;
  const s = document.createElement('style'); s.id = 'rtb-toast';
  s.textContent = '@keyframes rtbToastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}';
  document.head.appendChild(s);
})();

Object.assign(window, { ToastHost });
