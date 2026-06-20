/* Rattibha app — Checkout/Payment + Leave a review (set 4). Uses globals. */

/* ── Checkout / Payment ─────────────────────────────────────── */
function CheckoutScreen({ data, go, back }) {
  const { p, pkg } = data;
  const chosen = p.packages[pkg];
  const deposit = Math.round(chosen.price * 0.2);
  const [method, setMethod] = React.useState('card');
  const methods = [
    { k: 'card', label: isAR() ? 'بطاقة' : 'Card', icon: 'ph-credit-card' },
    { k: 'applepay', label: 'Apple Pay', icon: 'ph-apple-logo' },
    { k: 'tabby', label: isAR() ? 'تابي · ٤ دفعات' : 'Tabby · 4 splits', icon: 'ph-squares-four' },
  ];
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Checkout" sub={p.name} onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* order summary */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16,
          boxShadow: '0 8px 20px -14px rgba(43,34,51,0.18)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Photo seed={p.seed} style={{ width: 50, height: 50, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, color: C.ink, fontSize: 14.5 }}>{chosen.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{trPlanner(p, 'name')} · {isAR() ? '١٤ مارس ٢٠٢٦' : '14 Mar 2026'}</div>
            </div>
          </div>
          <div style={{ height: 1, background: C.border, margin: '13px 0' }} />
          <Line label={isAR() ? 'إجمالي الباقة' : 'Package total'} value={`SAR ${chosen.price.toLocaleString()}`} />
          <Line label={isAR() ? 'العربون (٢٠٪) مستحق اليوم' : 'Deposit (20%) due today'} value={`SAR ${deposit.toLocaleString()}`} strong />
          <Line label={isAR() ? 'المتبقّي قبل المناسبة' : 'Balance before event'} value={`SAR ${(chosen.price - deposit).toLocaleString()}`} muted />
        </div>

        {/* payment method */}
        <Field label={tr('Payment method')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map(m => {
              const on = method === m.k;
              return (
                <button key={m.k} onClick={() => setMethod(m.k)} style={{ all: 'unset', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14,
                    border: `1.5px solid ${on ? C.brand : C.border}`, background: on ? C.rose50 : C.surface }}>
                    <i className={`ph${m.k==='applepay'?'-fill':''} ${m.icon}`} style={{ fontSize: 22, color: on ? C.brand : C.ink }} />
                    <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{m.label}</span>
                    <div style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                      border: `2px solid ${on ? C.brand : C.borderStrong}`, display: 'grid', placeItems: 'center' }}>
                      {on && <div style={{ width: 10, height: 10, borderRadius: 999, background: C.brand }} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        {/* card form */}
        {method === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={isAR() ? 'رقم البطاقة' : 'Card number'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface,
                border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '12px 14px' }}>
                <i className="ph ph-credit-card" style={{ fontSize: 18, color: C.fg3 }} />
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: C.ink }}>4242 4242 4242 4242</span>
                <i className="ph-fill ph-circle" style={{ fontSize: 16, color: '#EB001B' }} />
                <i className="ph-fill ph-circle" style={{ fontSize: 16, color: '#F79E1B', marginLeft: -8 }} />
              </div>
            </Field>
            <div style={{ display: 'flex', gap: 12 }}>
              <Field label={isAR() ? 'الانتهاء' : 'Expiry'} style={{ flex: 1 }}><InputBox icon="ph-calendar-blank" value="08 / 27" /></Field>
              <Field label={isAR() ? 'رمز التحقّق' : 'CVV'} style={{ flex: 1 }}><InputBox icon="ph-lock-simple" value="•••" /></Field>
            </div>
            <Field label={isAR() ? 'الاسم على البطاقة' : 'Name on card'}><InputBox icon="ph-user" value="Nada Al-Rashid" /></Field>
          </div>
        )}
        {method !== 'card' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.rose50, borderRadius: 14,
            padding: '14px 16px' }}>
            <i className="ph-fill ph-info" style={{ fontSize: 19, color: C.brand }} />
            <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.brand, lineHeight: 1.45 }}>
              {isAR() ? `ستؤكّد الدفع عبر ${method === 'applepay' ? 'Apple Pay' : 'تابي'} في الخطوة التالية.` : `You'll confirm payment with ${method === 'applepay' ? 'Apple Pay' : 'Tabby'} on the next step.`}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12, color: C.fg3 }}>
          <i className="ph-fill ph-shield-check" style={{ fontSize: 17, color: C.emerald }} />
          {isAR() ? 'محمي بتشفير 256-bit · عربون مضمون' : 'Secured with 256-bit encryption · protected deposit'}
        </div>
      </div>
    </div>
  );
}

function CheckoutFooter({ data, go }) {
  const chosen = data.p.packages[data.pkg];
  const deposit = Math.round(chosen.price * 0.2);
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-fill ph-lock-simple" onClick={() => go('confirm', data)}>
        {isAR() ? `ادفع SAR ${deposit.toLocaleString()} الآن` : `Pay SAR ${deposit.toLocaleString()} now`}
      </Btn>
    </div>
  );
}

/* ── Leave a review ─────────────────────────────────────────── */
function ReviewScreen({ data, go, back }) {
  const p = (data && data.p) || PLANNERS[0];
  const [rating, setRating] = React.useState(5);
  const [tags, setTags] = React.useState(['Professional', 'On time']);
  const chips = ['Professional', 'On time', 'Great value', 'Creative', 'Responsive', 'Flawless setup'];
  const chipAR = { 'Professional': 'احترافي', 'On time': 'في الوقت', 'Great value': 'سعر ممتاز', 'Creative': 'إبداعي', 'Responsive': 'سريع الاستجابة', 'Flawless setup': 'تجهيز متقن' };
  const toggle = t => setTags(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);
  const labels = isAR() ? ['', 'ضعيف', 'مقبول', 'جيد', 'رائع', 'ممتاز'] : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="Leave a review" onBack={back} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* planner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 6 }}>
          <Photo seed={p.seed} style={{ width: 74, height: 74, borderRadius: 20 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>{trPlanner(p, 'name')}</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.fg3 }}>{isAR() ? 'باقة الزفاف · ١٤ مارس ٢٠٢٦' : 'Signature Wedding · 14 Mar 2026'}</div>
          </div>
        </div>

        {/* stars */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{ all: 'unset', cursor: 'pointer' }}>
                <i className={`ph-fill ph-star`} style={{ fontSize: 38, color: n <= rating ? C.gold : C.warm100 }} />
              </button>
            ))}
          </div>
          <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: C.gold }}>{labels[rating]}</span>
        </div>

        {/* tags */}
        <Field label={tr('What stood out?')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chips.map(t => {
              const on = tags.includes(t);
              return <button key={t} onClick={() => toggle(t)} style={{ all: 'unset', cursor: 'pointer',
                fontFamily: SANS, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 999,
                border: `1.5px solid ${on ? C.brand : C.borderStrong}`, background: on ? C.rose50 : C.surface,
                color: on ? C.brand : C.ink }}>{on && '✓ '}{isAR() ? chipAR[t] : t}</button>;
            })}
          </div>
        </Field>

        {/* comment */}
        <Field label={isAR() ? 'أخبر الآخرين عن تجربتك' : 'Tell others about your experience'}>
          <div style={{ border: `1.5px solid ${C.borderStrong}`, borderRadius: 14, padding: '13px 15px',
            background: C.surface, fontFamily: SANS, fontSize: 13.5, color: C.fg2, lineHeight: 1.55, minHeight: 96 }}>
            {isAR() ? 'سحري تمامًا — كل تفصيل في زفافنا كان مثاليًا. الفريق احترافي وهادئ وحوّل تصوّرنا الوردي والذهبي إلى واقع بديع. أنصح بهم بشدّة! 💜' : 'Absolutely magical — every detail of our wedding was perfect. The team was professional, calm and brought our rose & gold vision to life beautifully. Highly recommend! 💜'}
          </div>
        </Field>

        {/* photos */}
        <Field label={tr('Add photos (optional)')}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Photo seed={1} style={{ width: 70, height: 70, borderRadius: 12 }} />
            <Photo seed={4} style={{ width: 70, height: 70, borderRadius: 12 }} />
            <div style={{ width: 70, height: 70, borderRadius: 12, border: `1.5px dashed ${C.borderStrong}`,
              background: C.rose50, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <i className="ph ph-plus" style={{ fontSize: 22, color: C.brand }} />
            </div>
          </div>
        </Field>
      </div>
    </div>
  );
}

function ReviewFooter({ go }) {
  return (
    <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(transparent,rgba(250,247,242,0.96) 26%)' }}>
      <Btn full icon="ph-paper-plane-right" onClick={() => { if (window.rtbToast) window.rtbToast({ tone: 'success', title: tr('Review submitted'), sub: tr('Thank you for sharing your experience!') }); go('discover'); }}>{tr('Submit review')}</Btn>
    </div>
  );
}

Object.assign(window, { CheckoutScreen, CheckoutFooter, ReviewScreen, ReviewFooter });
