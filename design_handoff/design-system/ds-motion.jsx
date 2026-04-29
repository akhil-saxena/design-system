/* ═══ MOTION TOKENS ═══ */

const EASINGS = [
  { name: 'linear', value: 'linear', desc: 'No easing — mechanical' },
  { name: 'ease-out', value: 'cubic-bezier(0,0,.2,1)', desc: 'Decelerate — entries' },
  { name: 'ease-in', value: 'cubic-bezier(.4,0,1,1)', desc: 'Accelerate — exits' },
  { name: 'ease-in-out', value: 'cubic-bezier(.4,0,.2,1)', desc: 'Both — toggles, transforms' },
  { name: 'spring', value: 'cubic-bezier(.5,1.4,.5,1)', desc: 'Bounce — playful arrivals' },
  { name: 'snap', value: 'cubic-bezier(.9,0,.1,1)', desc: 'Quick & decisive — UI commits' },
];

const DURATIONS = [
  { name: 'instant', value: 80, desc: 'Hover, color shifts' },
  { name: 'fast', value: 150, desc: 'Active states, feedback' },
  { name: 'base', value: 220, desc: 'Most UI transitions' },
  { name: 'slow', value: 350, desc: 'Sheets, overlays' },
  { name: 'lazy', value: 600, desc: 'Hero entrances, large layouts' },
];

function MotionDemo({ easing, duration }) {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const id = setInterval(() => setActive(a => !a), duration + 800);
    return () => clearInterval(id);
  }, [duration]);
  return (
    <div style={{ width: 200, height: 36, background: 'var(--cream-2)', borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 4, left: 4, width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', transition: `transform ${duration}ms ${easing}`, transform: active ? 'translateX(164px)' : 'translateX(0)' }}></div>
    </div>
  );
}

function MotionSection() {
  const [easing, setEasing] = React.useState(EASINGS[3].value);
  const [duration, setDuration] = React.useState(220);

  return (
    <div>
      <DSSubsection title="Motion Tokens">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          A small set of named easings and durations keeps motion coherent. Pair an easing with a purpose — entries decelerate, exits accelerate, toggles meet in the middle.
        </p>

        <StateRow label="Easing curves">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, width: '100%' }}>
            {EASINGS.map(e => (
              <div key={e.name} className="glass" style={{ borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>{e.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{e.desc}</span>
                </div>
                <MotionDemo easing={e.value} duration={500} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', marginTop: 6 }}>{e.value}</div>
              </div>
            ))}
          </div>
        </StateRow>

        <StateRow label="Duration scale">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, width: '100%' }}>
            {DURATIONS.map(d => (
              <div key={d.name} className="glass" style={{ borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, color: 'var(--amber-d)' }}>{d.value}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)' }}>ms</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, marginTop: 6 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </StateRow>

        <StateRow label="Try combinations">
          <div className="glass" style={{ borderRadius: 12, padding: 18, width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Easing</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {EASINGS.map(e => (
                    <button key={e.name} className={`ds-btn ${easing === e.value ? 'amber' : ''}`} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setEasing(e.value)}>{e.name}</button>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Duration</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {DURATIONS.map(d => (
                    <button key={d.name} className={`ds-btn ${duration === d.value ? 'amber' : ''}`} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setDuration(d.value)}>{d.name} · {d.value}ms</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <MotionDemo easing={easing} duration={duration} />
              </div>
            </div>
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { MotionDemo, MotionSection });
