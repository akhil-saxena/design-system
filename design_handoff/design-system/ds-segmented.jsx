/* ═══ SEGMENTED CONTROL — polished ═══ */

function SegCtrl({ options, value, onChange, size = 'md', icons }) {
  const idx = options.indexOf(value);
  const sizeMap = { sm: { pad: '4px 12px', fs: 11, r: 6, gap: 2 }, md: { pad: '6px 16px', fs: 12, r: 8, gap: 3 }, lg: { pad: '9px 24px', fs: 14, r: 10, gap: 4 } };
  const s = sizeMap[size];

  return (
    <div style={{ display: 'inline-flex', background: 'var(--cream-2)', borderRadius: s.r, padding: s.gap, position: 'relative' }}>
      {/* Sliding thumb */}
      <div style={{
        position: 'absolute', top: s.gap, left: s.gap, height: `calc(100% - ${s.gap * 2}px)`,
        width: `calc(${100 / options.length}% - ${s.gap}px)`,
        transform: `translateX(calc(${idx * 100}% + ${idx * s.gap}px))`,
        background: 'rgba(255,255,255,.92)', borderRadius: s.r - 2,
        boxShadow: '0 1px 3px rgba(0,0,0,.08)', transition: 'transform .2s ease', zIndex: 0,
      }}></div>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange && onChange(opt)}
          style={{
            position: 'relative', zIndex: 1, padding: s.pad, border: 'none', background: 'none',
            fontSize: s.fs, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
            color: i === idx ? 'var(--ink)' : 'var(--ink-3)', transition: 'color .2s',
            whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          {icons && icons[i]}
          {opt}
        </button>
      ))}
    </div>
  );
}

function SegmentedControlSection() {
  const [view, setView] = React.useState('Board');
  const [period, setPeriod] = React.useState('Week');
  const [toggle, setToggle] = React.useState('Active');
  const [iconView, setIconView] = React.useState('Grid');

  const gridIc = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>;
  const listIc = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
  const calIc = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

  return (
    <div>
      <DSSubsection title="Segmented Controls">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          iOS-style toggle between options. Smooth sliding thumb animation. Supports icons, multiple sizes, and 2–4+ segments.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StateRow label="3 Options">
            <SegCtrl options={['Board', 'List', 'Calendar']} value={view} onChange={setView} />
          </StateRow>

          <StateRow label="With Icons">
            <SegCtrl options={['Grid', 'List', 'Calendar']} value={iconView} onChange={setIconView} icons={[gridIc, listIc, calIc]} />
          </StateRow>

          <StateRow label="Binary Toggle">
            <SegCtrl options={['Active', 'Archived']} value={toggle} onChange={setToggle} />
          </StateRow>

          <StateRow label="4 Options">
            <SegCtrl options={['Day', 'Week', 'Month', 'Year']} value={period} onChange={setPeriod} />
          </StateRow>

          <StateRow label="Sizes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', width: 24, fontWeight: 600 }}>SM</span>
                <SegCtrl options={['On', 'Off']} value="On" size="sm" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', width: 24, fontWeight: 600 }}>MD</span>
                <SegCtrl options={['On', 'Off']} value="On" size="md" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', width: 24, fontWeight: 600 }}>LG</span>
                <SegCtrl options={['On', 'Off']} value="On" size="lg" />
              </div>
            </div>
          </StateRow>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { SegmentedControlSection });
