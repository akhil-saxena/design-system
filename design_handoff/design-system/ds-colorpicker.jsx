/* ═══ COLOR PICKER — polished ═══ */

const CP_PRESETS = ['#f59e0b','#ef4444','#3b82f6','#8b5cf6','#22c55e','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1'];
const CP_STRIPS = [
  { label: 'Amber', colors: ['#fef3c7','#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706','#b45309','#92400e'] },
  { label: 'Blue', colors: ['#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af'] },
  { label: 'Neutral', colors: ['#f5f3f0','#ece8e3','#e7e2dc','#d6d3d1','#a8a29e','#6b6560','#44403c','#292524'] },
];

function ColorPickerSection() {
  const [color, setColor] = React.useState('#f59e0b');
  const [hex, setHex] = React.useState('#f59e0b');
  const [opacity, setOpacity] = React.useState(100);

  const handleHex = (val) => {
    setHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
  };

  const pick = (c) => { setColor(c); setHex(c); };

  return (
    <div>
      <DSSubsection title="Color Picker">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Gradient saturation/brightness area, hue bar, opacity slider, hex input, and preset swatches. Swatch strips show full tonal scales.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* Picker */}
          <div className="glass" style={{ borderRadius: 14, padding: 16 }}>
            {/* Gradient area */}
            <div style={{
              width: '100%', height: 150, borderRadius: 10, marginBottom: 12, position: 'relative', cursor: 'crosshair',
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${color})`,
            }}>
              <div style={{
                position: 'absolute', left: '72%', top: '28%', width: 16, height: 16,
                borderRadius: '50%', border: '2.5px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,.35)',
                transform: 'translate(-50%,-50%)', pointerEvents: 'none',
              }}></div>
            </div>

            {/* Hue bar */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', marginBottom: 4, fontWeight: 600 }}>HUE</div>
            <div style={{
              width: '100%', height: 12, borderRadius: 6, marginBottom: 12,
              background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              position: 'relative', cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', left: '10%', top: '50%', width: 14, height: 14,
                borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                transform: 'translate(-50%,-50%)', background: color,
              }}></div>
            </div>

            {/* Opacity bar */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', marginBottom: 4, fontWeight: 600 }}>OPACITY</div>
            <div style={{
              width: '100%', height: 12, borderRadius: 6, marginBottom: 14,
              background: `linear-gradient(to right, transparent, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/8px 8px`,
              position: 'relative', cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', left: `${opacity}%`, top: '50%', width: 14, height: 14,
                borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                transform: 'translate(-50%,-50%)', background: color,
              }}></div>
            </div>

            {/* Hex + preview */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: color,
                border: '1px solid var(--rule)', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,.08)',
              }}></div>
              <div className="ds-field" style={{ flex: 1 }}>
                <label className="ds-label">Hex</label>
                <input className="ds-input" value={hex} onChange={(e) => handleHex(e.target.value)} style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
              </div>
              <div className="ds-field" style={{ width: 56 }}>
                <label className="ds-label">Alpha</label>
                <input className="ds-input" value={`${opacity}%`} readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12, textAlign: 'center' }} />
              </div>
            </div>

            {/* Presets */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', marginBottom: 6, fontWeight: 600 }}>PRESETS</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {CP_PRESETS.map(c => (
                <div key={c} onClick={() => pick(c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
                  border: color === c ? '2.5px solid var(--ink)' : '1px solid var(--rule)',
                  transition: 'transform .1s, border .1s',
                }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
                  onMouseOut={e => e.currentTarget.style.transform = ''}
                />
              ))}
            </div>
          </div>

          {/* Right side: strips + inline input */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Tonal scales</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CP_STRIPS.map((strip, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', marginBottom: 5, fontWeight: 600 }}>{strip.label}</div>
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--rule)' }}>
                    {strip.colors.map((c, j) => (
                      <div key={j} onClick={() => pick(c)} title={c} style={{
                        flex: 1, height: 36, background: c, cursor: 'pointer', transition: 'transform .1s', position: 'relative',
                      }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scaleY(1.15)'}
                        onMouseOut={e => e.currentTarget.style.transform = ''}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10, marginTop: 24 }}>Inline color input</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="ds-field" style={{ width: 200 }}>
                <label className="ds-label">Label Color</label>
                <div className="ds-input-wrap">
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: color, border: '1px solid var(--rule)', cursor: 'pointer', flexShrink: 0 }}></div>
                  <input className="ds-input" value={hex} onChange={(e) => handleHex(e.target.value)} style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
                </div>
              </div>
              <button className="ds-btn ds-btn-sm" style={{ marginBottom: 1 }}>Apply</button>
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { ColorPickerSection });
