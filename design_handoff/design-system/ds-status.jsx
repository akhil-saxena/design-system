/* ═══ STATUS PAGES — 404, 500, maintenance, offline ═══ */

function StatusFrame({ label, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', height: 480, background: 'var(--cream)', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 12 }}>J</div>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, letterSpacing: '-.01em' }}>JobDash</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Sign in</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', alignItems: 'center', padding: '0 56px', gap: 40 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--amber-d)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Error 404 · Page not found</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 56, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-.035em', marginBottom: 14 }}>
            This page slipped<br/>through the cracks.
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 380, marginBottom: 24 }}>
            The link may be broken, or the application you're looking for has been archived. Try one of the routes below — most people find what they need within a click or two.
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <span style={{ padding: '11px 20px', background: 'var(--ink)', color: 'var(--cream)', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Back to dashboard</span>
            <span style={{ padding: '11px 20px', background: 'var(--surf-2)', color: 'var(--ink)', border: '1px solid var(--rule)', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Search</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Common destinations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['Application board', 'Calendar & interviews', 'Inbox & follow-ups', 'Resume & cover letters'].map(l => (
                <div key={l} style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 1, background: 'var(--ink-4)' }}/>
                  <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--ink-4)', textUnderlineOffset: 3 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Big 404 mark */}
        <div style={{ position: 'relative', height: 320 }}>
          <div style={{ position: 'absolute', inset: 0, fontFamily: 'var(--display)', fontSize: 280, fontWeight: 900, lineHeight: 0.85, letterSpacing: '-.06em', color: 'var(--ink)', textAlign: 'right' }}>
            404
          </div>
          {/* Sticker overlay */}
          <div style={{ position: 'absolute', top: 30, left: 30, padding: '8px 14px', background: 'var(--amber)', color: 'var(--ink)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', transform: 'rotate(-6deg)', boxShadow: '0 4px 14px rgba(245,158,11,.35)' }}>
            Not in the system
          </div>
          {/* Receipt overlay */}
          <div style={{ position: 'absolute', bottom: 18, left: 8, width: 180, padding: '12px 14px', background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 4, transform: 'rotate(4deg)', boxShadow: '0 8px 22px rgba(0,0,0,.1)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', color: 'var(--ink-3)' }}>REQUEST LOG</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink)', marginTop: 4 }}>GET /a/strpe-fe</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2 }}>404 · 18ms</div>
            <div style={{ borderTop: '1px dashed var(--ink-4)', margin: '8px 0' }}/>
            <div style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>Did you mean <span style={{ fontWeight: 700, color: 'var(--ink)' }}>stripe-fe</span>?</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerErrorPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1c1917' }}>
      <div style={{ padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f5f3f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f5f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1c1917', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 12 }}>J</div>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, letterSpacing: '-.01em' }}>JobDash</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10.5, color: '#fca5a5', letterSpacing: '.05em' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }}/>
          <span>Service degraded</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 56px', gap: 40, color: '#f5f3f0' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#fca5a5', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>500 · Internal server error</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 50, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-.035em', marginBottom: 14 }}>
            Something on our end<br/>broke. Not on yours.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(245,243,240,.7)', lineHeight: 1.5, maxWidth: 420, marginBottom: 22 }}>
            Our team has been paged automatically. Your data is safe — nothing was lost. Most outages resolve in under three minutes.
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <span style={{ padding: '11px 20px', background: 'var(--amber)', color: '#1c1917', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Try again</span>
            <span style={{ padding: '11px 20px', background: 'transparent', color: '#f5f3f0', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Status page →</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'rgba(245,243,240,.5)', letterSpacing: '.05em' }}>
            Incident ID · INC-7841-A2F · 14:32 UTC
          </div>
        </div>

        {/* Stack trace card */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 22, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ color: 'rgba(245,243,240,.7)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Live status</span>
            <span style={{ color: '#fbbf24', fontSize: 9.5, letterSpacing: '.05em' }}>● UPDATING</span>
          </div>
          {[
            ['API gateway', 'operational', '#22c55e'],
            ['Auth service', 'operational', '#22c55e'],
            ['Application sync', 'degraded', '#f59e0b'],
            ['AI cover letters', 'down', '#ef4444'],
            ['Email delivery', 'operational', '#22c55e'],
            ['Calendar sync', 'operational', '#22c55e'],
          ].map(([s, st, c]) => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'rgba(245,243,240,.85)' }}>{s}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: c, fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }}/>
                {st}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)', color: 'rgba(245,243,240,.5)', fontSize: 10 }}>
            Last update · 14:34:02 UTC
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenancePage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background marquee tape */}
      <div style={{ position: 'absolute', top: 60, left: -40, right: -40, padding: '8px 0', background: 'var(--amber)', transform: 'rotate(-1.5deg)', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800, letterSpacing: '.18em' }}>
          {' SCHEDULED MAINTENANCE · SCHEDULED MAINTENANCE · SCHEDULED MAINTENANCE · SCHEDULED MAINTENANCE · '.repeat(2)}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Back at 03:00 UTC · Sun, Oct 27</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 60, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-.04em', textAlign: 'center', marginBottom: 16 }}>
          We're moving<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 500 }}>some furniture.</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, textAlign: 'center', maxWidth: 480, marginBottom: 28 }}>
          JobDash is offline for a planned database upgrade. Everything will be exactly where you left it — just a touch faster.
        </div>

        {/* Countdown */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[['00', 'hours'], ['47', 'minutes'], ['12', 'seconds']].map(([n, l]) => (
            <div key={l} style={{ width: 88, padding: '14px 0', background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: 'var(--ink-3)' }}>
          <span>Follow updates →</span>
          <span style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid var(--rule)', fontWeight: 600, color: 'var(--ink-2)' }}>@jobdash</span>
          <span style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid var(--rule)', fontWeight: 600, color: 'var(--ink-2)' }}>status.jobdash.app</span>
        </div>
      </div>
    </div>
  );
}

function OfflinePage() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 800 }}>
        {/* Visual */}
        <div style={{ position: 'relative', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 240 240" style={{ width: 240, height: 240 }}>
            <circle cx="120" cy="120" r="100" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 5" opacity=".3"/>
            <circle cx="120" cy="120" r="70" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 5" opacity=".5"/>
            <circle cx="120" cy="120" r="40" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity=".8"/>
            {/* Cloud */}
            <g transform="translate(80 90)">
              <path d="M15 35 a18 18 0 0 1 5-35 a22 22 0 0 1 40 5 a14 14 0 0 1 18 30 z" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2"/>
              <line x1="20" y1="10" x2="60" y2="50" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
            </g>
            {/* Folder */}
            <g transform="translate(150 145)">
              <rect x="0" y="6" width="50" height="38" rx="4" fill="var(--amber)" stroke="var(--ink)" strokeWidth="2"/>
              <path d="M0 6 L0 0 L18 0 L22 6 Z" fill="var(--amber)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
              <text x="25" y="30" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fontWeight="700" fill="var(--ink)">CACHE</text>
            </g>
          </svg>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#ef4444', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }}/>
            No connection
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em', marginBottom: 12 }}>
            You're offline.<br/>Working from cache.
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 22 }}>
            We've kept your last 30 days of applications and notes available locally. Any edits you make will sync automatically when you reconnect.
          </div>

          <div style={{ padding: 14, background: 'var(--surf-2)', border: '1px solid var(--rule)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Pending changes</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--amber-d)' }}>3 queued</span>
            </div>
            {['Note added · Stripe — Sr Frontend', 'Status moved · Linear → Interview', 'Reminder created · Figma offer'].map(t => (
              <div key={t} style={{ fontSize: 12, color: 'var(--ink-2)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}/>
                {t}
              </div>
            ))}
          </div>

          <span style={{ display: 'inline-block', padding: '11px 20px', background: 'var(--ink)', color: 'var(--cream)', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Try reconnecting</span>
        </div>
      </div>
    </div>
  );
}

function StatusPagesSection() {
  return (
    <div>
      <DSSubsection title="Status Pages">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.5, maxWidth: 640 }}>
          Error and edge-state pages styled to match the rest of the system — same display + mono pairing, same colour vocabulary, same dry humour. Each one gives the user something useful to do.
        </p>
        <StatusFrame label="01 · 404 — Page not found">
          <NotFoundPage />
        </StatusFrame>
        <StatusFrame label="02 · 500 — Server error (dark)">
          <ServerErrorPage />
        </StatusFrame>
        <StatusFrame label="03 · Scheduled maintenance">
          <MaintenancePage />
        </StatusFrame>
        <StatusFrame label="04 · Offline — working from cache">
          <OfflinePage />
        </StatusFrame>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { StatusPagesSection });
