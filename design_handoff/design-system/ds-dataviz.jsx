/* ═══ DATA VIZ — Stats cards, sparklines, donut, bar chart, relative time, alert banners ═══ */

/* ─── Sparkline (pure SVG) ─── */
function Sparkline({ data, width = 100, height = 28, color = 'var(--amber)', fill = true }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `M0,${height} L${points} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={fillPath} fill={color} opacity=".1" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = width;
        const y = height - ((last - min) / range) * (height - 4) - 2;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

/* ─── Mini Donut ─── */
function MiniDonut({ value, max = 100, size = 48, strokeWidth = 5, color = 'var(--amber)' }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cream-2)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s ease-out' }} />
    </svg>
  );
}

/* ─── Bar Chart ─── */
function MiniBar({ data, labels, height = 100, barColor = 'var(--amber)' }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', fontWeight: 600 }}>{v}</span>
          <div style={{
            width: '100%', maxWidth: 32, borderRadius: '4px 4px 0 0',
            height: `${(v / max) * 70}%`, minHeight: 4,
            background: barColor, opacity: .8, transition: 'height .4s ease-out',
          }}></div>
          {labels && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-4)' }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

/* ─── Relative Time ─── */
function RelativeTime({ date, prefix }) {
  const [now] = React.useState(new Date(2026, 3, 24, 14, 0));
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  let rel;
  if (diffMin < 0) rel = `in ${Math.abs(diffMin)}m`;
  else if (diffMin < 60) rel = `${diffMin}m ago`;
  else if (diffH < 24) rel = `${diffH}h ago`;
  else if (diffD < 30) rel = `${diffD}d ago`;
  else rel = d.toLocaleDateString();

  return (
    <span className="ds-relative-time" title={d.toLocaleString()}>
      {prefix && <span style={{ color: 'var(--ink-4)' }}>{prefix} </span>}
      {rel}
    </span>
  );
}

function DataVizSection() {
  return (
    <div>
      <DSSubsection title="Stats Cards with Sparklines">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>Total Applications</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginTop: 4 }}>24</div>
              </div>
              <div style={{ padding: '3px 7px', borderRadius: 4, background: 'rgba(34,197,94,.1)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>+12%</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24]} color="var(--amber)" />
            </div>
          </div>

          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>Response Rate</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginTop: 4 }}>42%</div>
              </div>
              <div style={{ padding: '3px 7px', borderRadius: 4, background: 'rgba(239,68,68,.08)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--red)' }}>-5%</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={[60, 55, 50, 48, 52, 45, 42]} color="var(--red)" />
            </div>
          </div>

          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>Interviews</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginTop: 4 }}>7</div>
              </div>
              <div style={{ padding: '3px 7px', borderRadius: 4, background: 'rgba(34,197,94,.1)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>+3</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={[1, 1, 2, 2, 3, 4, 4, 5, 5, 7]} color="var(--green)" />
            </div>
          </div>

          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>Avg. Response</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginTop: 4 }}>4.2d</div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={[8, 6, 7, 5, 4, 5, 3, 4, 4, 4.2]} color="var(--blue)" />
            </div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Donut Charts">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Fit Score', value: 78, color: 'var(--green)' },
            { label: 'Completeness', value: 65, color: 'var(--amber)' },
            { label: 'Response', value: 42, color: 'var(--blue)' },
            { label: 'Match', value: 90, color: 'var(--purple)' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative' }}>
                <MiniDonut value={d.value} color={d.color} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>{d.value}%</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Bar Chart">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Applications by Stage</div>
            <MiniBar data={[5, 8, 3, 2, 1]} labels={['Wish', 'Applied', 'Screen', 'Interview', 'Offer']} barColor="var(--amber)" />
          </div>
          <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Weekly Activity</div>
            <MiniBar data={[2, 4, 1, 6, 3, 5, 3]} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} barColor="var(--blue)" />
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Relative Time">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Hover for exact timestamp. Auto-formats based on distance from now.</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { date: '2026-04-24T13:30:00', prefix: 'Updated' },
            { date: '2026-04-24T12:00:00', prefix: 'Replied' },
            { date: '2026-04-22T09:00:00', prefix: 'Applied' },
            { date: '2026-04-18T15:14:00', prefix: 'Contacted' },
            { date: '2026-03-28T11:40:00', prefix: 'Saved' },
          ].map((t, i) => (
            <div key={i} className="glass" style={{ padding: '8px 12px', borderRadius: 8 }}>
              <RelativeTime date={t.date} prefix={t.prefix} />
            </div>
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Alert Banners">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { type: 'info', icon: 'ℹ', text: 'Your trial project for Supabase starts May 8th. Prepare your development environment.', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.2)', color: 'var(--blue)' },
            { type: 'success', icon: '✓', text: 'Application to Automattic submitted successfully.', bg: 'rgba(34,197,94,.08)', border: 'rgba(34,197,94,.2)', color: 'var(--green)' },
            { type: 'warning', icon: '⚠', text: 'Raycast take-home is due in 2 days. You haven\'t started yet.', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)', color: 'var(--amber-d)' },
            { type: 'error', icon: '✕', text: 'Failed to sync with Google Calendar. Reconnect in Settings.', bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.2)', color: 'var(--red)' },
          ].map((a, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: a.bg, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: a.border, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{a.icon}</span>
              <span style={{ flex: 1, color: a.color, fontWeight: 500 }}>{a.text}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" width="14" height="14" style={{ cursor: 'pointer', opacity: .6, flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          ))}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { DataVizSection, Sparkline, MiniDonut, MiniBar, RelativeTime });
