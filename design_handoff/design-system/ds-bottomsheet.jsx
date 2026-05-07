/* ═══ BOTTOM SHEET (mobile) ═══ */

function BottomSheetDemo({ open, onClose, snap = 'half', children }) {
  const heights = { quarter: 200, half: 360, full: 520 };
  const h = heights[snap] || 360;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: open ? 'rgba(0,0,0,.4)' : 'rgba(0,0,0,0)', transition: 'background .25s', borderRadius: 18 }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: 'var(--cream)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 24px rgba(0,0,0,.15)', transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .3s cubic-bezier(.4,.2,.2,1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--ink-5)' }}></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 18px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function BottomSheetSection() {
  const [openA, setOpenA] = React.useState(true);
  const [snapA, setSnapA] = React.useState('half');
  const [openB, setOpenB] = React.useState(true);

  const phoneFrame = (children) => (
    <div style={{ width: 240, height: 460, borderRadius: 22, background: '#1c1917', padding: 8, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 18, background: 'var(--cream-2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: 14, fontSize: 11, color: 'var(--ink-3)' }}>Background content</div>
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <DSSubsection title="Bottom Sheet (mobile)">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Modal drawer that slides up from the bottom. Snap points let users peek (quarter), inspect (half), or fully expand. Drag handle for affordance.
        </p>

        <StateRow label="Action menu sheet">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {phoneFrame(
              <BottomSheetDemo open={openA} onClose={() => setOpenA(false)} snap={snapA}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Application actions</div>
                {[
                  { i: '✎', l: 'Edit application', c: 'var(--ink)' },
                  { i: '↗', l: 'Open job posting', c: 'var(--ink)' },
                  { i: '☆', l: 'Mark as priority', c: 'var(--ink)' },
                  { i: '✓', l: 'Move to interviewing', c: 'var(--green)' },
                  { i: '✕', l: 'Withdraw', c: 'var(--red)' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i === 0 ? 'none' : '1px solid var(--rule)', cursor: 'pointer' }}>
                    <span style={{ width: 22, color: a.c, fontSize: 14, textAlign: 'center' }}>{a.i}</span>
                    <span style={{ fontSize: 13, color: a.c, fontWeight: 500 }}>{a.l}</span>
                  </div>
                ))}
              </BottomSheetDemo>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="ds-btn" onClick={() => setOpenA(true)}>Open</button>
              <button className="ds-btn" onClick={() => setOpenA(false)}>Close</button>
              <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Snap</div>
              {['quarter', 'half', 'full'].map(s => (
                <button key={s} className={`ds-btn ${snapA === s ? 'amber' : ''}`} onClick={() => setSnapA(s)}>{s}</button>
              ))}
            </div>
          </div>
        </StateRow>

        <StateRow label="Filter sheet — fullscreen content">
          <div style={{ display: 'flex', gap: 16 }}>
            {phoneFrame(
              <BottomSheetDemo open={openB} onClose={() => setOpenB(false)} snap="full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>Filter jobs</div>
                  <span style={{ fontSize: 12, color: 'var(--amber-d)', fontWeight: 600, cursor: 'pointer' }}>Reset</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((s, i) => (
                    <div key={s} className="ds-chip" style={{ background: i < 2 ? 'var(--amber-l)' : undefined, borderColor: i < 2 ? 'rgba(245,158,11,.4)' : undefined }}>{s}</div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Salary</div>
                <input className="ds-input" type="range" style={{ width: '100%', marginBottom: 14 }} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Location</div>
                <input className="ds-input" placeholder="Anywhere" style={{ width: '100%', marginBottom: 16 }} />
                <button className="ds-btn amber" style={{ width: '100%' }}>Show 47 results</button>
              </BottomSheetDemo>
            )}
            <button className="ds-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setOpenB(!openB)}>{openB ? 'Close' : 'Open'}</button>
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { BottomSheetDemo, BottomSheetSection });
