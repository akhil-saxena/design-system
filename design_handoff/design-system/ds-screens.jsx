/* ═══ SAMPLE PRODUCT SCREENS — system in real context ═══ */

function ScreenFrame({ label, children, height = 720 }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }}/>
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--cream)', height, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Screen 1: Settings page ─────────────────────────────────── */
function SettingsScreen() {
  const [tab, setTab] = React.useState('Profile');
  const tabs = ['Profile', 'Notifications', 'Integrations', 'Billing', 'Team'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '1px solid var(--rule)', padding: 20, background: 'var(--surf-1)' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Settings</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Account preferences</div>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: tab === t ? 600 : 500,
            color: tab === t ? 'var(--cream)' : 'var(--ink-2)', background: tab === t ? 'var(--ink)' : 'transparent',
            cursor: 'pointer', marginBottom: 2,
          }}>{t}</div>
        ))}
      </aside>
      {/* Main */}
      <main style={{ overflowY: 'auto', padding: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Settings · {tab}</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28 }}>How you appear across JobDash and to employers.</p>

        {/* Avatar row */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: 18, border: '1px solid var(--rule)', borderRadius: 12, background: 'var(--surf-1)', marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>SM</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Sarah Marshall</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>sarah.marshall@email.com · Joined March 2024</div>
          </div>
          <span className="ds-btn">Change avatar</span>
          <span className="ds-btn ghost" style={{ color: 'var(--red)' }}>Remove</span>
        </div>

        {/* Form fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[
            { l: 'Display name', v: 'Sarah Marshall' },
            { l: 'Headline', v: 'Senior Frontend Engineer' },
            { l: 'Location', v: 'Brooklyn, NY' },
            { l: 'Phone', v: '+1 (555) 234-9012' },
          ].map(f => (
            <div key={f.l}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5 }}>{f.l}</div>
              <input className="ds-input" defaultValue={f.v} style={{ width: '100%' }}/>
            </div>
          ))}
        </div>

        {/* Toggles */}
        <div style={{ padding: 18, border: '1px solid var(--rule)', borderRadius: 12, background: 'var(--surf-1)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Visibility</div>
          {[
            ['Public profile', 'Anyone can find your profile in search', true],
            ['Open to offers', 'Show recruiters you are open to new roles', true],
            ['Show salary expectations', 'Display your range on your profile', false],
          ].map(([t, d, on]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{d}</div>
              </div>
              <div className={`ds-toggle ${on ? 'on' : ''}`}><div className="ds-toggle-thumb"/></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <span className="ds-btn ghost">Cancel</span>
          <span className="ds-btn dark">Save changes</span>
        </div>
      </main>
    </div>
  );
}

/* ── Screen 2: Onboarding ─────────────────────────────────────── */
function OnboardingScreen() {
  const steps = ['Welcome', 'Goals', 'Skills', 'Notifications'];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16 }}>JobDash</div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Step 2 of 4</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer' }}>Skip for now</span>
      </div>

      {/* Stepper */}
      <div style={{ padding: '20px 60px', borderBottom: '1px solid var(--rule)' }}>
        <div className="ds-stepper-hz">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`ds-step-hz ${i === 1 ? 'active' : i < 1 ? 'done' : ''}`}>
                <div className="ds-step-hz-dot">{i < 1 ? '✓' : i + 1}</div>
                <div>
                  <div className="ds-step-hz-label">{s}</div>
                </div>
              </div>
              {i < steps.length - 1 && <div className={`ds-step-hz-line ${i < 1 ? 'done' : ''}`}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, overflowY: 'auto' }}>
        <div style={{ maxWidth: 540, width: '100%' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber-d)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>What brings you here</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 10 }}>What are you hoping to achieve?</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.55 }}>Pick all that apply. We'll tailor your dashboard around these goals.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {[
              { t: 'Find a new role', d: 'Actively applying', on: true },
              { t: 'Track applications', d: 'Stay organized', on: true },
              { t: 'Practice for interviews', d: 'Prep with AI coach', on: false },
              { t: 'Network with peers', d: 'Connect & share', on: false },
              { t: 'Improve my resume', d: 'AI-assisted edits', on: true },
              { t: 'Negotiate offers', d: 'Get coaching', on: false },
            ].map((o, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 12,
                border: o.on ? '1.5px solid var(--amber)' : '1px solid var(--rule)',
                background: o.on ? 'rgba(245,158,11,.06)' : 'var(--surf-1)',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{o.t}</div>
                  <div className={`ds-checkbox ${o.on ? 'checked' : ''}`}>{o.on && <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{o.d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="ds-btn ghost">← Back</span>
            <span className="ds-btn dark" style={{ padding: '10px 22px' }}>Continue →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Screen 3: Dashboard ──────────────────────────────────────── */
function DashboardScreen() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--cream)' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Tuesday, October 22</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em' }}>Good afternoon, Sarah</div>
        </div>
        <span className="ds-btn amber" style={{ padding: '8px 14px' }}>+ Add application</span>
      </div>

      <div style={{ padding: 32 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { l: 'Active applications', v: '24', d: '+3 this week', up: true },
            { l: 'Interviews scheduled', v: '6', d: '2 upcoming', up: true },
            { l: 'Response rate', v: '38%', d: '↑ 4% vs last month', up: true },
            { l: 'Avg. response time', v: '4.2d', d: '↓ 1.1d faster', up: false },
          ].map(s => (
            <div key={s.l} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--rule)', background: 'var(--surf-1)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{s.l}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: s.up ? 'var(--green)' : 'var(--ink-3)', marginTop: 8, fontWeight: 600 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* Two col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          {/* Recent activity */}
          <div style={{ padding: 18, borderRadius: 12, border: '1px solid var(--rule)', background: 'var(--surf-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Recent activity</div>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer' }}>View all →</span>
            </div>
            {[
              { c: 'Stripe', r: 'Senior Frontend Engineer', t: 'Interview scheduled', w: 'Tue, Oct 28', s: 'amber' },
              { c: 'Linear', r: 'Staff Engineer, UI Platform', t: 'Application viewed', w: '2h ago', s: 'blue' },
              { c: 'Figma', r: 'Senior Product Designer', t: 'Offer received', w: 'Yesterday', s: 'green' },
              { c: 'Notion', r: 'Frontend Engineer', t: 'Recruiter replied', w: '2d ago', s: 'blue' },
              { c: 'Vercel', r: 'Senior Software Engineer', t: 'Application sent', w: '3d ago', s: 'ink' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 11, fontWeight: 800 }}>{a.c.slice(0, 1)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.r} <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>· {a.c}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.t}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{a.w}</div>
              </div>
            ))}
          </div>

          {/* Upcoming interviews */}
          <div style={{ padding: 18, borderRadius: 12, border: '1px solid var(--rule)', background: 'var(--surf-1)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>This week</div>
            {[
              { d: '28', m: 'OCT', co: 'Stripe', r: 'Tech screen · 11:00', amber: true },
              { d: '30', m: 'OCT', co: 'Linear', r: 'Hiring manager · 14:30' },
              { d: '02', m: 'NOV', co: 'Figma', r: 'Final round · all day' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: e.amber ? 'var(--amber)' : 'var(--cream-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 800, lineHeight: 1, color: 'var(--ink)' }}>{e.d}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: 'var(--ink)' }}>{e.m}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.co}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{e.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Screen 4: Pricing ────────────────────────────────────────── */
function PricingScreen() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--cream)' }}>
      <div style={{ padding: '40px 32px 24px', textAlign: 'center', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber-d)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Pricing</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 900, letterSpacing: '-.025em', lineHeight: 1, marginBottom: 12 }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 480, margin: '0 auto' }}>Free forever for individuals. Upgrade when you need more applications, AI features, or team plans.</p>
      </div>

      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, maxWidth: 1000, margin: '0 auto' }}>
        {[
          { name: 'Free', price: '$0', sub: 'forever', features: ['10 active applications', 'Basic kanban tracking', 'Email reminders', 'Resume export (PDF)'], cta: 'Current plan', current: true },
          { name: 'Pro', price: '$9', sub: 'per month', highlight: true, features: ['Unlimited applications', 'AI cover letters', 'Salary insights', 'Interview prep coach', 'Priority support'], cta: 'Upgrade to Pro' },
          { name: 'Team', price: '$24', sub: 'per seat / month', features: ['Everything in Pro', 'Shared application boards', 'Team analytics', 'Admin controls', 'SSO & audit logs'], cta: 'Contact sales' },
        ].map(p => (
          <div key={p.name} style={{
            padding: 24, borderRadius: 14,
            border: p.highlight ? '1.5px solid var(--ink)' : '1px solid var(--rule)',
            background: p.highlight ? 'var(--ink)' : 'var(--surf-1)',
            color: p.highlight ? 'var(--cream)' : 'var(--ink)',
            position: 'relative',
          }}>
            {p.highlight && <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--amber)', color: 'var(--ink)', fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '.08em', textTransform: 'uppercase' }}>Most popular</div>}
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 44, fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1 }}>{p.price}</span>
              <span style={{ fontSize: 12, color: p.highlight ? 'var(--cream-3)' : 'var(--ink-3)' }}>{p.sub}</span>
            </div>
            <div style={{ borderTop: p.highlight ? '1px solid rgba(255,255,255,.15)' : '1px solid var(--rule)', paddingTop: 16, marginBottom: 18 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '5px 0', fontSize: 12.5 }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={p.highlight ? 'var(--amber)' : 'var(--green)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <span style={{
              display: 'block', textAlign: 'center', padding: '10px 0',
              borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: p.current ? 'default' : 'pointer',
              background: p.current ? 'transparent' : (p.highlight ? 'var(--amber)' : 'var(--ink)'),
              color: p.current ? (p.highlight ? 'var(--cream-3)' : 'var(--ink-3)') : (p.highlight ? 'var(--ink)' : 'var(--cream)'),
              border: p.current ? '1px solid var(--rule)' : 'none',
            }}>{p.cta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SampleScreensSection() {
  return (
    <div>
      <DSSubsection title="Sample Product Screens">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.5, maxWidth: 640 }}>
          Real product pages composed entirely from this design system — no extra CSS, no off-system colors, no
          one-off components. These are the templates new pages should remix.
        </p>

        <ScreenFrame label="01 · Settings · Profile">
          <SettingsScreen />
        </ScreenFrame>

        <ScreenFrame label="02 · Onboarding · Goals (step 2 of 4)" height={680}>
          <OnboardingScreen />
        </ScreenFrame>

        <ScreenFrame label="03 · Home Dashboard">
          <DashboardScreen />
        </ScreenFrame>

        <ScreenFrame label="04 · Pricing">
          <PricingScreen />
        </ScreenFrame>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { SampleScreensSection });
