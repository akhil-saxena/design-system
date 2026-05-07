/* ═══ PICKERS v2 — Date/time picker, multi-select with search, range slider, chips ═══ */

function DatePickerSection() {
  const [selectedDate, setSelectedDate] = React.useState(24);
  const [selectedTime, setSelectedTime] = React.useState('14:00');
  const [rangeStart, setRangeStart] = React.useState(16);
  const [rangeEnd, setRangeEnd] = React.useState(30);
  const [hoveredDay, setHoveredDay] = React.useState(null);
  const today = 24;
  const daysInMonth = 30;
  const startDay = 3;
  const monthName = 'April 2026';
  const events = { 24: 'Recruiter intro', 29: 'Tech screen' };
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isInRange = (d) => d && d >= Math.min(rangeStart, rangeEnd) && d <= Math.max(rangeStart, rangeEnd);

  return (
    <div>
      <DSSubsection title="Calendar with Time Picker">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Full date + time selection. Events shown as amber dots. Click a day, then pick a time slot.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 140px 1fr', gap: 16 }}>
          {/* Calendar */}
          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>{monthName}</span>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', padding: '4px 0', letterSpacing: '.05em' }}>{d}</div>
              ))}
              {days.map((d, i) => {
                const isSelected = d === selectedDate;
                const isToday = d === today && !isSelected;
                const isPast = d && d < today;
                return (
                  <div key={i} onClick={() => d && d >= today && setSelectedDate(d)}
                    onMouseEnter={() => d && setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8, fontSize: 12, cursor: d && d >= today ? 'pointer' : 'default',
                      fontWeight: isSelected ? 700 : 400,
                      background: isSelected ? 'var(--amber)' : isToday ? 'var(--amber-l)' : hoveredDay === d && d >= today ? 'var(--cream-2)' : 'transparent',
                      color: isSelected ? '#fff' : isPast ? 'var(--ink-4)' : d ? 'var(--ink)' : 'transparent',
                      position: 'relative', transition: 'background .1s',
                      opacity: isPast && !isSelected ? .5 : 1,
                    }}>
                    {d || ''}
                    {d && events[d] && <span style={{ position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : 'var(--amber)' }}></span>}
                  </div>
                );
              })}
            </div>
            {selectedDate && events[selectedDate] && (
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--amber-l)', border: '1px solid rgba(245,158,11,.2)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber-d)', fontWeight: 600 }}>
                {events[selectedDate]} · Apr {selectedDate}
              </div>
            )}
          </div>

          {/* Time picker */}
          <div className="glass" style={{ padding: 8, borderRadius: 14, maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '6px 8px', fontWeight: 700 }}>Time</div>
            {times.map(t => (
              <div key={t} onClick={() => setSelectedTime(t)} style={{
                padding: '7px 10px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 12, cursor: 'pointer',
                fontWeight: t === selectedTime ? 700 : 400,
                background: t === selectedTime ? 'var(--amber)' : 'transparent',
                color: t === selectedTime ? '#fff' : 'var(--ink-2)',
                transition: 'background .1s',
                marginBottom: 2,
              }}
                onMouseOver={e => { if (t !== selectedTime) e.currentTarget.style.background = 'var(--cream-2)'; }}
                onMouseOut={e => { if (t !== selectedTime) e.currentTarget.style.background = ''; }}
              >{t}</div>
            ))}
          </div>

          {/* Result + date inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Selected</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.02em' }}>Apr {selectedDate}, 2026</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--amber-d)', fontWeight: 600, marginTop: 2 }}>{selectedTime}</div>
            </div>
            <div className="ds-field">
              <label className="ds-label">Date input</label>
              <div className="ds-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <input className="ds-input" value={`Apr ${selectedDate}, 2026 at ${selectedTime}`} readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
              </div>
            </div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Date Range Picker">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Click to set start, click again for end. Range highlights between.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>{monthName}</span>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', padding: '4px 0' }}>{d}</div>
              ))}
              {days.map((d, i) => {
                const isStart = d === rangeStart;
                const isEnd = d === rangeEnd;
                const inRange = isInRange(d);
                return (
                  <div key={i} onClick={() => {
                    if (!d) return;
                    if (!rangeStart || (rangeStart && rangeEnd)) { setRangeStart(d); setRangeEnd(d); }
                    else { setRangeEnd(d); }
                  }} style={{
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : inRange ? 0 : 8,
                    fontSize: 12, cursor: d ? 'pointer' : 'default',
                    fontWeight: (isStart || isEnd) ? 700 : 400,
                    background: (isStart || isEnd) ? 'var(--amber)' : inRange ? 'var(--amber-l)' : 'transparent',
                    color: (isStart || isEnd) ? '#fff' : d ? 'var(--ink)' : 'transparent',
                    transition: 'background .1s',
                  }}>{d || ''}</div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div className="ds-field" style={{ flex: 1 }}>
              <label className="ds-label">Start</label>
              <div className="ds-input-wrap"><input className="ds-input" value={`Apr ${rangeStart}`} readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12 }} /></div>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-4)', marginTop: 28 }}>→</span>
            <div className="ds-field" style={{ flex: 1 }}>
              <label className="ds-label">End</label>
              <div className="ds-input-wrap"><input className="ds-input" value={`Apr ${rangeEnd}`} readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12 }} /></div>
            </div>
            <div className="glass" style={{ padding: '10px 14px', borderRadius: 8, marginTop: 20, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--amber-d)', fontWeight: 600 }}>
              {Math.abs(rangeEnd - rangeStart) + 1} days
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

/* ─── Multi Select with Search ─── */
function MultiSelect({ label, options, defaultSelected }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultSelected || []);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); } };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const toggle = (o) => setSelected(s => s.includes(o) ? s.filter(x => x !== o) : [...s, o]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ds-field" ref={ref}>
      <label className="ds-label">{label}</label>
      <div className="ds-select" onClick={() => { setOpen(!open); setSearch(''); }} data-open={open} style={{ flexWrap: 'wrap', minHeight: 38 }}>
        {selected.length === 0 && <span style={{ color: 'var(--ink-4)' }}>Select…</span>}
        {selected.map(s => (
          <span key={s} className="ds-chip" style={{ padding: '2px 6px', fontSize: 10, gap: 4 }}>
            {s}
            <span className="ds-chip-x" onClick={e => { e.stopPropagation(); toggle(s); }}>×</span>
          </span>
        ))}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ marginLeft: 'auto', flexShrink: 0, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : '' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {open && (
        <div className="ds-dropdown">
          <input className="ds-dropdown-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} autoFocus onClick={e => e.stopPropagation()} />
          {filtered.map(o => (
            <div key={o} className={`ds-dropdown-item ${selected.includes(o) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggle(o); }}>
              <div className={`ds-checkbox ${selected.includes(o) ? 'checked' : ''}`} style={{ width: 16, height: 16, borderRadius: 4 }}>
                {selected.includes(o) && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              {o}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-4)' }}>No results</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Range Slider ─── */
function RangeSlider({ min, max, value, onChange, label, formatFn }) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackRef = React.useRef(null);

  const handleMove = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(min + pct * (max - min)));
  };

  const onDown = (e) => {
    handleMove(e.clientX);
    const onMove = (ev) => handleMove(ev.clientX);
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="ds-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="ds-label">{label}</label>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--amber-d)' }}>{formatFn ? formatFn(value) : value}</span>
      </div>
      <div ref={trackRef} className="ds-slider-track" onMouseDown={onDown}>
        <div className="ds-slider-fill" style={{ width: `${pct}%` }}></div>
        <div className="ds-slider-thumb" style={{ left: `${pct}%` }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)' }}>{formatFn ? formatFn(min) : min}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)' }}>{formatFn ? formatFn(max) : max}</span>
      </div>
    </div>
  );
}

function ChipsSection() {
  const [tags, setTags] = React.useState(['React', 'TypeScript', 'Remote', 'Async']);
  const [inputVal, setInputVal] = React.useState('');
  const [sliderVal, setSliderVal] = React.useState(120000);

  const removeTag = (t) => setTags(tags.filter(x => x !== t));
  const addTag = () => { if (inputVal.trim() && !tags.includes(inputVal.trim())) { setTags([...tags, inputVal.trim()]); setInputVal(''); } };

  return (
    <div>
      <DSSubsection title="Editable Tag List">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Type and press Enter to add. Click × to remove. Duplicates prevented.</p>
        <div className="glass" style={{ padding: 12, borderRadius: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {tags.map(t => (
            <span key={t} className="ds-chip" style={{ background: 'rgba(245,158,11,.1)', borderColor: 'rgba(245,158,11,.2)' }}>
              {t}
              <span className="ds-chip-x" onClick={() => removeTag(t)}>×</span>
            </span>
          ))}
          <input className="ds-chip-input" placeholder="Add tag…" value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Backspace' && !inputVal && tags.length) setTags(tags.slice(0, -1)); }} />
        </div>
      </DSSubsection>

      <DSSubsection title="Multi-Select with Search">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <MultiSelect label="Required skills" options={['React', 'TypeScript', 'PHP', 'Python', 'Go', 'Rust', 'GraphQL', 'REST APIs', 'AWS', 'Docker', 'Kubernetes']} defaultSelected={['React', 'TypeScript']} />
          <MultiSelect label="Work preferences" options={['Remote', 'Hybrid', 'On-site', 'Async-first', 'Flexible hours', '4-day week']} defaultSelected={['Remote', 'Async-first']} />
        </div>
      </DSSubsection>

      <DSSubsection title="Range Slider">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <RangeSlider min={30000} max={300000} value={sliderVal} onChange={setSliderVal} label="Target salary" formatFn={v => '$' + v.toLocaleString()} />
          <RangeSlider min={0} max={100} value={78} onChange={() => {}} label="Fit score" formatFn={v => v + '%'} />
        </div>
      </DSSubsection>

      <DSSubsection title="Chip Variants">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></svg>Remote</span>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>$70K–170K</span>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>2d ago</span>
          <span className="ds-chip" style={{ background: 'var(--ink)', color: 'var(--cream)', borderColor: 'var(--ink)' }}>Dark chip</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Skill Chips (match/miss)">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="ds-skill match"><span className="dot" style={{ background: '#22c55e' }}></span>React · 5y</span>
          <span className="ds-skill match"><span className="dot" style={{ background: '#22c55e' }}></span>TypeScript · 4y</span>
          <span className="ds-skill miss"><span className="dot" style={{ background: '#ef4444' }}></span>WordPress ecosystem</span>
          <span className="ds-skill" style={{ borderColor: 'rgba(59,130,246,.25)', background: 'rgba(59,130,246,.08)', color: 'var(--blue)' }}><span className="dot" style={{ background: '#3b82f6' }}></span>Learning</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Badges">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="ds-badge upcoming">Upcoming</span>
          <span className="ds-badge passed">Passed</span>
          <span className="ds-badge pending">Pending</span>
          <span className="ds-badge done">Done</span>
          <span className="ds-badge" style={{ background: 'var(--amber-l)', color: 'var(--amber-d)' }}>3</span>
          <span className="ds-badge" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>New</span>
          <span className="ds-badge" style={{ background: 'rgba(239,68,68,.12)', color: 'var(--red)' }}>Urgent</span>
          <span className="ds-badge" style={{ background: 'rgba(34,197,94,.12)', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }}></span>Active
          </span>
        </div>
      </DSSubsection>

      <DSSubsection title="Pipeline Stepper">
        <div className="glass" style={{ padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 0 }}>
          {['Saved','Applied','Screening','Interview','Offer'].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ width: 24, height: 1, background: i <= 2 ? 'var(--ink-3)' : 'var(--ink-5)', flexShrink: 0 }}></div>}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px',
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
                color: i < 2 ? 'var(--ink-3)' : i === 2 ? 'var(--blue)' : 'var(--ink-4)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: i < 2 ? 'var(--ink-3)' : i === 2 ? 'var(--blue)' : 'var(--ink-5)',
                  boxShadow: i === 2 ? '0 0 0 4px rgba(59,130,246,.15)' : 'none'
                }}></span>
                {s}
              </div>
            </React.Fragment>
          ))}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { DatePickerSection, ChipsSection, MultiSelect, RangeSlider });
