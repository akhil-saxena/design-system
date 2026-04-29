/* ═══ FOOTERS ═══ */

function FooterSimple() {
  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-3)', background: 'var(--cream)' }}>
      <span>© 2026 JobDash · v1.0.0</span>
      <div style={{ display: 'flex', gap: 16 }}>
        <span style={{ cursor: 'pointer' }}>Privacy</span>
        <span style={{ cursor: 'pointer' }}>Terms</span>
        <span style={{ cursor: 'pointer' }}>Help</span>
      </div>
    </div>
  );
}

function FooterMulti() {
  const cols = [
    { title: 'Product', links: ['Dashboard', 'Job Tracker', 'Resume Builder', 'Interviews'] },
    { title: 'Resources', links: ['Help Center', 'Templates', 'Career Guide', 'Blog'] },
    { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
  ];
  return (
    <div style={{ padding: '32px 28px 20px', borderTop: '1px solid var(--rule)', background: 'var(--cream)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 32, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--ink)', color: 'var(--amber)', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 15 }}>JobDash</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 12 }}>The job search tool that keeps your sanity intact. Track every application, every conversation.</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['T', 'L', 'G'].map(s => (
              <div key={s} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', cursor: 'pointer' }}>{s}</div>
            ))}
          </div>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>{c.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {c.links.map(l => <span key={l} style={{ fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>{l}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-4)' }}>
        <span>© 2026 JobDash, Inc. All rights reserved.</span>
        <span>Made with intention in California.</span>
      </div>
    </div>
  );
}

function FooterSticky() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: 16, fontSize: 12, color: 'var(--ink-3)', background: 'var(--cream)', borderRadius: '10px 10px 0 0' }}>Page content…</div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--rule)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 10px 10px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>3 unsaved changes</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ds-btn">Discard</button>
          <button className="ds-btn amber">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function FooterSection() {
  return (
    <div>
      <DSSubsection title="Footers">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Page-bottom containers — from a quiet copyright bar to a full marketing footer to a sticky action bar.
        </p>

        <StateRow label="Simple — copyright + utility links">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <FooterSimple />
          </div>
        </StateRow>

        <StateRow label="Multi-column — marketing">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <FooterMulti />
          </div>
        </StateRow>

        <StateRow label="Sticky action bar">
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <FooterSticky />
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { FooterSimple, FooterMulti, FooterSticky, FooterSection });
