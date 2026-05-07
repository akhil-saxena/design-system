/* ═══ STICKY HEADER / APP BAR ═══ */

function AppBar({ variant = 'default', scrolled = false }) {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: scrolled ? 'rgba(255,255,255,.92)' : 'var(--surf-2)',
    backdropFilter: 'blur(14px)',
    borderBottom: `1px solid ${scrolled ? 'var(--rule)' : 'transparent'}`,
    boxShadow: scrolled ? '0 4px 16px rgba(0,0,0,.04)' : 'none',
    transition: 'all .2s ease',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  };

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13 }}>J</div>
      <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, letterSpacing: '-.02em' }}>JobDash</span>
    </div>
  );

  if (variant === 'minimal') {
    return (
      <div style={baseStyle}>
        <Logo />
        <button className="ds-btn dark">Sign in</button>
      </div>
    );
  }

  if (variant === 'centered') {
    return (
      <div style={{ ...baseStyle, justifyContent: 'center', position: 'relative' }}>
        <Logo />
        <div style={{ position: 'absolute', right: 20, display: 'flex', gap: 6 }}>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></button>
        </div>
      </div>
    );
  }

  if (variant === 'withSearch') {
    return (
      <div style={baseStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Logo />
          <div className="ds-input-wrap" style={{ width: 280 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ink-4)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="ds-input" placeholder="Search jobs, companies..." />
            <span className="ds-kbd">⌘K</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></button>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber), var(--amber-d))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>JS</div>
        </div>
      </div>
    );
  }

  // default: with nav links
  return (
    <div style={baseStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Logo />
        <nav style={{ display: 'flex', gap: 18 }}>
          {['Dashboard', 'Applications', 'Companies', 'Resume'].map((l, i) => (
            <span key={l} style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', borderBottom: i === 0 ? '2px solid var(--amber)' : '2px solid transparent', paddingBottom: 14, marginBottom: -14 }}>{l}</span>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="ds-btn">+ New</button>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber), var(--amber-d))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>JS</div>
      </div>
    </div>
  );
}

function AppBarSection() {
  const [scrolled, setScrolled] = React.useState(false);

  return (
    <div>
      <DSSubsection title="Sticky Header / App Bar">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Top-level navigation bar that stays fixed during scroll. Background opacity and shadow intensify as content scrolls beneath it.
        </p>

        <StateRow label="Default — with nav links">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            <AppBar />
            <div style={{ padding: 24, fontSize: 12, color: 'var(--ink-3)' }}>Page content scrolls underneath…</div>
          </div>
        </StateRow>

        <StateRow label="With search">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            <AppBar variant="withSearch" />
            <div style={{ padding: 24, fontSize: 12, color: 'var(--ink-3)' }}>Page content…</div>
          </div>
        </StateRow>

        <StateRow label="Minimal — for marketing/landing">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            <AppBar variant="minimal" />
            <div style={{ padding: 24, fontSize: 12, color: 'var(--ink-3)' }}>Hero content…</div>
          </div>
        </StateRow>

        <StateRow label="Centered logo">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            <AppBar variant="centered" />
            <div style={{ padding: 24, fontSize: 12, color: 'var(--ink-3)' }}>Editorial content…</div>
          </div>
        </StateRow>

        <StateRow label="Scroll behavior — toggle to preview">
          <div style={{ width: '100%' }}>
            <label className="ds-check-label" style={{ marginBottom: 10, fontSize: 12 }}>
              <div className={`ds-toggle ${scrolled ? 'on' : ''}`} onClick={() => setScrolled(!scrolled)}>
                <div className="ds-toggle-thumb"></div>
              </div>
              Scrolled state (opacity + shadow)
            </label>
            <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
              <AppBar scrolled={scrolled} />
              <div style={{ padding: 24, fontSize: 12, color: 'var(--ink-3)' }}>Page content…</div>
            </div>
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { AppBar, AppBarSection });
