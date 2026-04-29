/* ═══ ONBOARDING / COACH MARKS ═══ */

function CoachMark({ title, desc, step, total, position = 'bottom', arrowAlign = 'left', onNext, onSkip, onDone }) {
  const isLast = step === total;
  const arrowStyle = {
    position: 'absolute', width: 12, height: 12, background: 'rgba(255,255,255,.97)', transform: 'rotate(45deg)',
    border: '1px solid var(--rule)', zIndex: -1,
  };
  const arrowPos = position === 'bottom'
    ? { top: -6, [arrowAlign]: 20, borderBottom: 'none', borderRight: 'none' }
    : { bottom: -6, [arrowAlign]: 20, borderTop: 'none', borderLeft: 'none' };

  return (
    <div className="ds-coach-mark" style={{ position: 'relative' }}>
      <div style={{ ...arrowStyle, ...arrowPos }}></div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: i + 1 === step ? 16 : 6, height: 6, borderRadius: 3, background: i + 1 === step ? 'var(--amber)' : 'var(--cream-2)', transition: 'all .2s' }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!isLast && <button className="ds-btn ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={onSkip}>Skip</button>}
          <button className="ds-btn amber" style={{ fontSize: 11, padding: '4px 12px' }} onClick={isLast ? onDone : onNext}>
            {isLast ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpotlightOverlay({ targetRect, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={targetRect.x - 4} y={targetRect.y - 4} width={targetRect.w + 8} height={targetRect.h + 8} rx="8" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,.45)" mask="url(#spotlight-mask)" />
      </svg>
      <div style={{
        position: 'absolute', left: targetRect.x - 6, top: targetRect.y - 6,
        width: targetRect.w + 12, height: targetRect.h + 12,
        borderRadius: 10, border: '2px solid var(--amber)',
        boxShadow: '0 0 0 4px rgba(245,158,11,.15)',
        pointerEvents: 'none',
      }}></div>
    </div>
  );
}

function CoachMarksSection() {
  const [step, setStep] = React.useState(1);
  const [dismissed, setDismissed] = React.useState(false);

  const steps = [
    { title: 'Add your first application', desc: 'Click this button to start tracking a job. You can add company name, role, and more.', target: { x: 20, y: 12, w: 140, h: 36 } },
    { title: 'Track your progress', desc: 'Drag cards between columns to update your application status as you move through stages.', target: { x: 180, y: 12, w: 120, h: 36 } },
    { title: 'Set reminders', desc: 'Never miss a follow-up. Click the bell to set interview and deadline reminders.', target: { x: 320, y: 12, w: 36, h: 36 } },
  ];

  const current = steps[step - 1];

  return (
    <div>
      <DSSubsection title="Onboarding Coach Marks">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Step-through highlights that guide new users. Spotlight dims the rest of the page and highlights the target element. Includes progress dots, skip, and dismiss.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Interactive demo */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', height: 320 }}>
            {/* Fake toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="ds-btn amber ds-btn-sm">Add Application</button>
              <button className="ds-btn ds-btn-sm">Board View</button>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>
              </button>
            </div>
            {/* Fake content */}
            <div style={{ padding: 16, display: 'flex', gap: 12 }}>
              {['Wishlist', 'Applied', 'Interviewing'].map(col => (
                <div key={col} style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>{col}</div>
                  <div style={{ height: 40, borderRadius: 8, border: '1.5px dashed var(--rule)', marginBottom: 6 }}></div>
                  {col === 'Applied' && <div style={{ height: 40, borderRadius: 8, border: '1.5px dashed var(--rule)' }}></div>}
                </div>
              ))}
            </div>

            {!dismissed && (
              <>
                <SpotlightOverlay targetRect={current.target} visible />
                <div style={{ position: 'absolute', left: current.target.x, top: current.target.y + current.target.h + 12, zIndex: 10, width: 280 }}>
                  <CoachMark
                    title={current.title}
                    desc={current.desc}
                    step={step}
                    total={3}
                    onNext={() => setStep(s => Math.min(3, s + 1))}
                    onSkip={() => setDismissed(true)}
                    onDone={() => setDismissed(true)}
                  />
                </div>
              </>
            )}
            {dismissed && (
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
                <button className="ds-btn ds-btn-sm" onClick={() => { setStep(1); setDismissed(false); }}>Restart Tour</button>
              </div>
            )}
          </div>

          {/* Static examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>Coach mark variants</div>
            <CoachMark title="Welcome to JobDash" desc="Let's take a quick tour to help you get started tracking your applications." step={1} total={4} />
            <CoachMark title="Keyboard shortcuts" desc="Press ⌘K anytime to search, or ⌘N to add a new application." step={3} total={4} />
            <CoachMark title="You're all set!" desc="You can always replay this tour from Settings → Help." step={4} total={4} />
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { CoachMarksSection });
