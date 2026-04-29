/* ═══ FORMS v2 — Refined inputs, custom numeric, salary, file upload, inline edit ═══ */

function ButtonsSection() {
  const [loading, setLoading] = React.useState(false);
  const [ripple, setRipple] = React.useState(null);

  const handleRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 500);
  };

  return (
    <div>
      <DSSubsection title="Button Variants">
        <StateRow label="Primary (dark)">
          <button className="ds-btn dark">Default</button>
          <button className="ds-btn dark hover">Hover</button>
          <button className="ds-btn dark focus">Focused</button>
          <button className="ds-btn dark" disabled>Disabled</button>
          <button className="ds-btn dark loading" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
            {loading ? <><span className="spinner"></span>Saving…</> : 'Click to load'}
          </button>
        </StateRow>
        <StateRow label="Amber (CTA)">
          <button className="ds-btn amber">Default</button>
          <button className="ds-btn amber hover">Hover</button>
          <button className="ds-btn amber" disabled>Disabled</button>
        </StateRow>
        <StateRow label="Secondary">
          <button className="ds-btn">Default</button>
          <button className="ds-btn hover">Hover</button>
          <button className="ds-btn" disabled>Disabled</button>
        </StateRow>
        <StateRow label="Ghost">
          <button className="ds-btn ghost">Default</button>
          <button className="ds-btn ghost hover">Hover</button>
        </StateRow>
        <StateRow label="Danger">
          <button className="ds-btn danger">Delete</button>
          <button className="ds-btn danger hover">Hover</button>
        </StateRow>
      </DSSubsection>

      <DSSubsection title="Button Sizes">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="ds-btn dark ds-btn-xs">Extra Small</button>
          <button className="ds-btn dark ds-btn-sm">Small</button>
          <button className="ds-btn dark">Medium</button>
          <button className="ds-btn dark ds-btn-lg">Large</button>
        </div>
      </DSSubsection>

      <DSSubsection title="Icon Buttons">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 5v14M5 12h14"></path></svg></button>
          <button className="ds-icbtn active"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect></svg></button>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', marginLeft: 8 }}>Default · Starred · Archive · More</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Button Groups">
        <div style={{ display: 'flex' }}>
          {['Board', 'List', 'Calendar'].map((t, i) => (
            <button key={t} className={`ds-btn ${i === 0 ? 'dark' : ''}`} style={{
              borderRadius: i === 0 ? '7px 0 0 7px' : i === 2 ? '0 7px 7px 0' : 0,
              marginLeft: i > 0 ? -1 : 0, position: 'relative', zIndex: i === 0 ? 1 : 0
            }}>{t}</button>
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Buttons with icons">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ds-btn dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M12 5v14M5 12h14"></path></svg>Add Application</button>
          <button className="ds-btn amber">Advance →</button>
          <button className="ds-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Upload</button>
          <button className="ds-btn ghost">↗ Open full posting</button>
        </div>
      </DSSubsection>
    </div>
  );
}

/* ─── Custom Numeric Stepper ─── */
function NumericStepper({ value, onChange, min, max, step = 1, prefix, suffix, formatFn }) {
  const [internal, setInternal] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => { if (!focused) setInternal(String(value)); }, [value, focused]);

  const inc = () => { const v = Math.min((max ?? Infinity), value + step); onChange(v); };
  const dec = () => { const v = Math.max((min ?? -Infinity), value - step); onChange(v); };

  const commit = () => {
    let v = parseFloat(internal.replace(/[^0-9.\-]/g, ''));
    if (isNaN(v)) v = value;
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    onChange(v);
    setFocused(false);
  };

  const display = focused ? internal : (formatFn ? formatFn(value) : String(value));

  return (
    <div className="ds-stepper">
      <button className="ds-stepper-btn" onClick={dec} disabled={min != null && value <= min}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <div className="ds-stepper-display">
        {prefix && <span className="ds-stepper-affix">{prefix}</span>}
        <input className="ds-stepper-input" value={display}
          onFocus={() => { setFocused(true); setInternal(String(value)); }}
          onChange={e => setInternal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'ArrowUp') { e.preventDefault(); inc(); } if (e.key === 'ArrowDown') { e.preventDefault(); dec(); } }}
        />
        {suffix && <span className="ds-stepper-affix">{suffix}</span>}
      </div>
      <button className="ds-stepper-btn" onClick={inc} disabled={max != null && value >= max}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><path d="M12 5v14M5 12h14"></path></svg>
      </button>
    </div>
  );
}

/* ─── Rolling Animated Number ─── */
function RollingNumber({ value, digits = 6, prefix = '' }) {
  const str = String(Math.round(value)).padStart(digits, '0');
  return (
    <div className="ds-rolling">
      {prefix && <span className="ds-rolling-prefix">{prefix}</span>}
      {str.split('').map((d, i) => (
        <div key={i} className="ds-rolling-digit">
          <div className="ds-rolling-strip" style={{ transform: `translateY(-${parseInt(d) * 10}%)`, transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)' }}>
            {[0,1,2,3,4,5,6,7,8,9].map(n => <div key={n} className="ds-rolling-num">{n}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Salary Range Input ─── */
function SalaryRange({ minVal, maxVal, onMinChange, onMaxChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <NumericStepper value={minVal} onChange={onMinChange} min={0} max={maxVal} step={5000} prefix="$" formatFn={v => v.toLocaleString()} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-4)' }}>to</span>
        <NumericStepper value={maxVal} onChange={onMaxChange} min={minVal} step={5000} prefix="$" formatFn={v => v.toLocaleString()} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>Live preview:</span>
        <RollingNumber value={minVal} prefix="$" />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)' }}>—</span>
        <RollingNumber value={maxVal} prefix="$" />
      </div>
    </div>
  );
}

/* ─── Inline Edit ─── */
function InlineEdit({ initial, monoStyle }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(initial);
  const ref = React.useRef(null);

  React.useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);

  if (editing) {
    return <input ref={ref} className="ds-inline-edit-input" value={val}
      style={monoStyle ? { fontFamily: 'var(--mono)' } : {}}
      onChange={e => setVal(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(false); if (e.key === 'Escape') { setVal(initial); setEditing(false); } }} />;
  }
  return (
    <span className="ds-inline-edit" style={monoStyle ? { fontFamily: 'var(--mono)' } : {}} onClick={() => setEditing(true)}>
      {val}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11" className="ds-inline-edit-icon"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
    </span>
  );
}

function InputsSection() {
  const [salary, setSalary] = React.useState({ min: 70000, max: 170000 });
  const [numVal, setNumVal] = React.useState(5000);
  const [pct, setPct] = React.useState(78);

  return (
    <div>
      <DSSubsection title="Text Input States">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="ds-field"><label className="ds-label">Company</label><input className="ds-input" placeholder="Enter company name…" /></div>
          <div className="ds-field"><label className="ds-label">Role</label><input className="ds-input" defaultValue="Senior Engineer" /></div>
          <div className="ds-field"><label className="ds-label">Disabled</label><input className="ds-input" defaultValue="Can't edit" disabled /></div>
          <div className="ds-field"><label className="ds-label">Error</label><input className="ds-input error" defaultValue="bad@" /><span className="ds-error-text">Please enter a valid URL</span></div>
          <div className="ds-field">
            <label className="ds-label">Search with shortcut</label>
            <div className="ds-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"></circle></svg>
              <input className="ds-input" placeholder="Search applications…" />
              <span className="ds-kbd">⌘K</span>
            </div>
          </div>
          <div className="ds-field">
            <label className="ds-label">URL input</label>
            <div className="ds-input-wrap">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>https://</span>
              <input className="ds-input" placeholder="linkedin.com/in/…" style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
            </div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Custom Numeric Stepper">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>No native browser arrows. Custom ＋/－ buttons, keyboard arrow support, direct type-in with validation. Smooth transitions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="ds-field">
            <label className="ds-label">Basic number</label>
            <NumericStepper value={numVal} onChange={setNumVal} min={0} max={99999} step={100} />
          </div>
          <div className="ds-field">
            <label className="ds-label">Percentage</label>
            <NumericStepper value={pct} onChange={setPct} min={0} max={100} step={1} suffix="%" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Days in stage</label>
            <NumericStepper value={14} onChange={() => {}} min={0} step={1} suffix="days" />
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Salary Range with Rolling Display">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Rolling animated digits update live as you click ＋/－ or type. Min is clamped to max and vice versa.</p>
        <SalaryRange minVal={salary.min} maxVal={salary.max}
          onMinChange={v => setSalary(s => ({ ...s, min: Math.min(v, s.max) }))}
          onMaxChange={v => setSalary(s => ({ ...s, max: Math.max(v, s.min) }))} />
      </DSSubsection>

      <DSSubsection title="Inline Editable Text">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Click any value to edit in place. Press Enter to confirm, Escape to cancel.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="ds-field">
            <label className="ds-label">Company</label>
            <InlineEdit initial="Automattic" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Salary</label>
            <InlineEdit initial="$70,000 – $170,000" monoStyle />
          </div>
          <div className="ds-field">
            <label className="ds-label">Role</label>
            <InlineEdit initial="Experienced Software Engineer" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Source</label>
            <InlineEdit initial="Company Website" />
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Textarea">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="ds-field">
            <label className="ds-label">Notes</label>
            <textarea className="ds-textarea" rows={3} placeholder="Add notes about this application…"></textarea>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', textAlign: 'right' }}>0 / 500</span>
          </div>
          <div className="ds-field">
            <label className="ds-label">Cover letter excerpt</label>
            <textarea className="ds-textarea" rows={3} defaultValue="I'm excited about Automattic's async-first culture and would love to contribute to WooCommerce."></textarea>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', textAlign: 'right' }}>94 / 500</span>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Select / Dropdown">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <SelectDropdown label="Stage" options={['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer']} defaultVal="Applied" dotColors={{ Wishlist: 'var(--ink-4)', Applied: 'var(--blue)', Screening: 'var(--purple)', Interviewing: 'var(--amber)', Offer: 'var(--green)' }} />
          <SelectDropdown label="Priority" options={['Low', 'Medium', 'High', 'Urgent']} defaultVal="Medium" dotColors={{ Low: 'var(--ink-5)', Medium: 'var(--amber)', High: 'var(--red)', Urgent: 'var(--red)' }} />
          <SelectDropdown label="Source" options={['Company Website', 'LinkedIn', 'Referral', 'AngelList', 'Other']} defaultVal="Company Website" />
        </div>
      </DSSubsection>
    </div>
  );
}

function SelectDropdown({ label, options, defaultVal, dotColors }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultVal);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); } };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ds-field" ref={ref}>
      <label className="ds-label">{label}</label>
      <div className="ds-select" onClick={() => { setOpen(!open); setSearch(''); }} data-open={open}>
        {dotColors && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColors[selected] || 'var(--ink-4)', flexShrink: 0 }}></span>}
        <span style={{ flex: 1 }}>{selected}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ transition: 'transform .15s', transform: open ? 'rotate(180deg)' : '' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {open && (
        <div className="ds-dropdown">
          <input className="ds-dropdown-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} autoFocus onClick={e => e.stopPropagation()} />
          {filtered.map(o => (
            <div key={o} className={`ds-dropdown-item ${o === selected ? 'active' : ''}`} onClick={() => { setSelected(o); setOpen(false); setSearch(''); }}>
              {dotColors && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColors[o] || 'var(--ink-4)' }}></span>}
              {o}
              {o === selected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-4)' }}>No results</div>}
        </div>
      )}
    </div>
  );
}

function ControlsSection() {
  const [checks, setChecks] = React.useState({ a: true, b: false, c: false });
  const [radio, setRadio] = React.useState('remote');
  const [toggles, setToggles] = React.useState({ notif: true, dark: false, auto: true });

  return (
    <div>
      <DSSubsection title="Checkboxes">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[{ id: 'a', label: 'Remote only' }, { id: 'b', label: 'Has referral' }, { id: 'c', label: 'Cover letter sent' }].map(c => (
            <label key={c.id} className="ds-check-label">
              <div className={`ds-checkbox ${checks[c.id] ? 'checked' : ''}`} onClick={() => setChecks(p => ({ ...p, [c.id]: !p[c.id] }))}>
                {checks[c.id] && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              {c.label}
            </label>
          ))}
          <label className="ds-check-label" style={{ opacity: .4, pointerEvents: 'none' }}>
            <div className="ds-checkbox disabled"></div>Disabled
          </label>
          <label className="ds-check-label" style={{ opacity: .4, pointerEvents: 'none' }}>
            <div className="ds-checkbox checked disabled"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Checked disabled
          </label>
        </div>
      </DSSubsection>

      <DSSubsection title="Radio Buttons">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['remote', 'hybrid', 'onsite'].map(v => (
            <label key={v} className="ds-check-label" onClick={() => setRadio(v)}>
              <div className={`ds-radio ${radio === v ? 'checked' : ''}`}>
                {radio === v && <div className="ds-radio-dot"></div>}
              </div>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
          <label className="ds-check-label" style={{ opacity: .4, pointerEvents: 'none' }}>
            <div className="ds-radio disabled"></div>Disabled
          </label>
        </div>
      </DSSubsection>

      <DSSubsection title="Toggles">
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[{ id: 'notif', label: 'Email notifications' }, { id: 'dark', label: 'Dark mode' }, { id: 'auto', label: 'Auto-advance stage' }].map(t => (
            <label key={t.id} className="ds-check-label">
              <div className={`ds-toggle ${toggles[t.id] ? 'on' : ''}`} onClick={() => setToggles(p => ({ ...p, [t.id]: !p[t.id] }))}>
                <div className="ds-toggle-thumb"></div>
              </div>
              {t.label}
            </label>
          ))}
          <label className="ds-check-label" style={{ opacity: .4, pointerEvents: 'none' }}>
            <div className="ds-toggle disabled"><div className="ds-toggle-thumb"></div></div>
            Disabled
          </label>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { ButtonsSection, InputsSection, ControlsSection, SelectDropdown, NumericStepper, RollingNumber, SalaryRange, InlineEdit });
