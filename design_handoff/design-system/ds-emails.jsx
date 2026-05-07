/* ═══ EMAIL TEMPLATES — production-ready transactional emails ═══ */

const EMAIL_PALETTE = {
  cream: '#f5f3f0',
  cream2: '#ece8e3',
  ink: '#292524',
  ink2: '#57534e',
  ink3: '#6b6560',
  amber: '#f59e0b',
  amberD: '#b45309',
  rule: 'rgba(0,0,0,.08)',
  green: '#15803d',
};

function EmailFrame({ subject, preview, children, label }) {
  const P = EMAIL_PALETTE;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', background: '#e9e5df' }}>
        {/* Mail client chrome */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule)', background: 'var(--surf-3)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>From: JobDash &lt;hello@jobdash.app&gt; · To: sarah.marshall@email.com</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{subject}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{preview}</div>
        </div>
        {/* Email body — table-based for compatibility */}
        <div style={{ padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
          <table cellPadding="0" cellSpacing="0" style={{ width: 560, maxWidth: '100%', background: '#fff', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmailHeader() {
  const P = EMAIL_PALETTE;
  return (
    <tr>
      <td style={{ padding: '24px 32px', borderBottom: `1px solid ${P.rule}`, background: P.cream }}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}><tbody><tr>
          <td>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-.02em', color: P.ink }}>JobDash</span>
          </td>
          <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.ink3, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Tuesday · Oct 22
          </td>
        </tr></tbody></table>
      </td>
    </tr>
  );
}

function EmailFooter() {
  const P = EMAIL_PALETTE;
  return (
    <tr>
      <td style={{ padding: '20px 32px', borderTop: `1px solid ${P.rule}`, background: P.cream2, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: P.ink3, lineHeight: 1.6, marginBottom: 10 }}>
          You're receiving this because you have a JobDash account.<br />
          <a href="#" style={{ color: P.ink2, textDecoration: 'underline' }}>Manage email preferences</a> · <a href="#" style={{ color: P.ink2, textDecoration: 'underline' }}>Unsubscribe</a>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.ink3, letterSpacing: '.05em' }}>
          JobDash · 432 Park Avenue, NY · © 2025
        </div>
      </td>
    </tr>
  );
}

/* Template 1 — Welcome */
function WelcomeEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="01 · Welcome" subject="Welcome to JobDash, Sarah 👋" preview="Your job search just got organized. Here's how to get started.">
      <EmailHeader />
      <tr><td style={{ padding: '40px 32px 28px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.amberD, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Welcome aboard</div>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 32, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.05, color: P.ink, margin: '0 0 14px' }}>
          Your job search,<br />finally organized.
        </h1>
        <p style={{ fontSize: 14, color: P.ink2, lineHeight: 1.6, margin: '0 0 24px' }}>
          Hey Sarah — welcome to JobDash. We built this because tracking applications across spreadsheets,
          inboxes, and sticky notes is exhausting. Now they all live in one place.
        </p>
        <a href="#" style={{ display: 'inline-block', background: P.ink, color: P.cream, padding: '12px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Open your dashboard →</a>
      </td></tr>
      <tr><td style={{ padding: '0 32px 28px' }}>
        <div style={{ height: 1, background: P.rule, margin: '0 0 24px' }} />
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Three things to try first</div>
        {[
          ['01', 'Add your first application', 'Paste a job link and we\'ll auto-fill the company, role, and key dates.'],
          ['02', 'Connect your inbox', 'JobDash will detect recruiter emails and update your kanban automatically.'],
          ['03', 'Set up reminders', 'Never miss a follow-up. We\'ll nudge you 3 days after applying.'],
        ].map(([n, t, d]) => (
          <table key={n} cellPadding="0" cellSpacing="0" style={{ width: '100%', marginBottom: 14 }}><tbody><tr>
            <td style={{ width: 38, verticalAlign: 'top' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: P.amberD, fontWeight: 700, letterSpacing: '.08em' }}>{n}</div>
            </td>
            <td>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: P.ink, marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: P.ink2, lineHeight: 1.5 }}>{d}</div>
            </td>
          </tr></tbody></table>
        ))}
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

/* Template 2 — Interview reminder */
function InterviewReminderEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="02 · Interview reminder" subject="Heads up: Stripe tech screen tomorrow at 11:00" preview="A quick prep checklist for your interview with Maya Chen.">
      <EmailHeader />
      <tr><td style={{ padding: '32px 32px 8px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.amberD, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Reminder · in 18 hours</div>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15, color: P.ink, margin: '0 0 16px' }}>
          Tech screen tomorrow at 11:00
        </h1>
      </td></tr>
      <tr><td style={{ padding: '0 32px 24px' }}>
        {/* Event card */}
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%', background: P.cream, borderRadius: 10, marginBottom: 20 }}><tbody>
          <tr><td style={{ padding: 18 }}>
            <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}><tbody><tr>
              <td style={{ width: 56, verticalAlign: 'top' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: P.amber, textAlign: 'center', padding: '7px 0' }}>
                  <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 16, fontWeight: 800, color: P.ink, lineHeight: 1 }}>23</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: P.ink, letterSpacing: '.08em' }}>OCT</div>
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: P.ink }}>Stripe — Senior Frontend Engineer</div>
                <div style={{ fontSize: 12.5, color: P.ink2, marginTop: 3 }}>Tech screen with Maya Chen · 60 min</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: P.ink3, marginTop: 8, letterSpacing: '.04em' }}>Wed, Oct 23 · 11:00 – 12:00 EDT · Google Meet</div>
              </td>
            </tr></tbody></table>
          </td></tr>
        </tbody></table>

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Prep checklist</div>
        {[
          'Review the role description and Stripe Press articles',
          'Pull up your portfolio — Maya mentioned wanting to discuss the dashboard project',
          'Test your camera and mic 10 minutes before',
          'Have 2–3 questions ready about team structure and roadmap',
        ].map((t, i) => (
          <table key={i} cellPadding="0" cellSpacing="0" style={{ width: '100%', marginBottom: 8 }}><tbody><tr>
            <td style={{ width: 22, verticalAlign: 'top', paddingTop: 3 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${P.ink3}` }} />
            </td>
            <td><div style={{ fontSize: 13, color: P.ink2, lineHeight: 1.5 }}>{t}</div></td>
          </tr></tbody></table>
        ))}

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <a href="#" style={{ display: 'inline-block', background: P.ink, color: P.cream, padding: '10px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 12.5 }}>Open application</a>
          <a href="#" style={{ display: 'inline-block', background: 'transparent', color: P.ink2, padding: '10px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 12.5, border: `1px solid ${P.rule}` }}>Reschedule</a>
        </div>
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

/* Template 3 — Weekly digest */
function WeeklyDigestEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="03 · Weekly digest" subject="Your week on JobDash · 3 wins, 2 follow-ups" preview="A snapshot of progress, plus what to tackle next week.">
      <EmailHeader />
      <tr><td style={{ padding: '36px 32px 24px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.amberD, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Weekly digest · Oct 14 – 20</div>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.1, color: P.ink, margin: '0 0 8px' }}>
          A productive week, Sarah.
        </h1>
        <p style={{ fontSize: 13.5, color: P.ink2, lineHeight: 1.55, margin: 0 }}>You sent 4 applications, scheduled 2 interviews, and got 1 offer. Here's the breakdown.</p>
      </td></tr>

      {/* Stats */}
      <tr><td style={{ padding: '0 32px 8px' }}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}><tbody><tr>
          {[['4', 'Applied'], ['2', 'Interviewing'], ['1', 'Offer'], ['38%', 'Response']].map(([v, l], i) => (
            <td key={i} style={{ width: '25%', padding: '14px 8px', textAlign: 'center', background: i === 2 ? P.amber : P.cream, borderRight: i < 3 ? `1px solid ${P.rule}` : 'none' }}>
              <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 24, fontWeight: 800, color: P.ink, letterSpacing: '-.02em', lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: 5 }}>{l}</div>
            </td>
          ))}
        </tr></tbody></table>
      </td></tr>

      <tr><td style={{ padding: '24px 32px 28px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Highlights</div>
        {[
          { c: 'green', t: 'Figma sent an offer', d: '$185k base · awaiting your response by Oct 28' },
          { c: 'amber', t: 'Stripe moved you to tech screen', d: 'Scheduled for Wed, Oct 23 at 11:00' },
          { c: 'ink', t: 'Linear application viewed', d: 'Recruiter opened your application 3 times this week' },
        ].map((h, i) => (
          <table key={i} cellPadding="0" cellSpacing="0" style={{ width: '100%', marginBottom: 10 }}><tbody><tr>
            <td style={{ width: 8, verticalAlign: 'stretch' }}>
              <div style={{ width: 3, height: 36, background: h.c === 'green' ? P.green : h.c === 'amber' ? P.amber : P.ink, borderRadius: 2 }} />
            </td>
            <td style={{ paddingLeft: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: P.ink }}>{h.t}</div>
              <div style={{ fontSize: 12, color: P.ink2, marginTop: 2 }}>{h.d}</div>
            </td>
          </tr></tbody></table>
        ))}

        <div style={{ height: 1, background: P.rule, margin: '20px 0 18px' }} />
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Follow up next week</div>
        <div style={{ fontSize: 13, color: P.ink2, lineHeight: 1.6 }}>
          • <strong style={{ color: P.ink }}>Notion</strong> — applied 9 days ago, no response yet<br />
          • <strong style={{ color: P.ink }}>Vercel</strong> — recruiter said they'd circle back this week
        </div>
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

/* Template 4 — Offer received */
function OfferEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="04 · Offer received 🎉" subject="Figma sent you an offer" preview="Senior Product Designer · $185k base. Let's break it down.">
      <EmailHeader />
      <tr><td style={{ padding: 0 }}>
        {/* Hero block */}
        <div style={{ background: P.amber, padding: '36px 32px 32px', textAlign: 'center', borderBottom: `1px solid ${P.rule}` }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.ink, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, opacity: .7 }}>Offer received</div>
          <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 36, fontWeight: 900, letterSpacing: '-.025em', lineHeight: 1, color: P.ink, margin: '0 0 8px' }}>Big news, Sarah.</h1>
          <div style={{ fontSize: 15, color: P.ink, fontWeight: 600 }}>Figma sent you an offer.</div>
        </div>
      </td></tr>
      <tr><td style={{ padding: '28px 32px 0' }}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%', border: `1px solid ${P.rule}`, borderRadius: 10 }}><tbody>
          {[
            ['Role', 'Senior Product Designer'],
            ['Base salary', '$185,000'],
            ['Equity', '0.04% (4-yr vest, 1-yr cliff)'],
            ['Sign-on', '$15,000'],
            ['Start date', 'Negotiable, target Nov 18'],
            ['Decision by', 'Oct 28, 2025'],
          ].map(([k, v], i, arr) => (
            <tr key={k}>
              <td style={{ width: 130, padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, borderBottom: i < arr.length - 1 ? `1px solid ${P.rule}` : 'none', verticalAlign: 'middle' }}>{k}</td>
              <td style={{ padding: '12px 16px', fontSize: 13.5, color: P.ink, fontWeight: 600, borderBottom: i < arr.length - 1 ? `1px solid ${P.rule}` : 'none' }}>{v}</td>
            </tr>
          ))}
        </tbody></table>
      </td></tr>
      <tr><td style={{ padding: '24px 32px 32px' }}>
        <p style={{ fontSize: 13, color: P.ink2, lineHeight: 1.6, margin: '0 0 20px' }}>
          The full offer letter is attached. Take your time — you have until Oct 28 to respond. JobDash can help you negotiate, compare against your other open conversations, and draft your response.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="#" style={{ display: 'inline-block', background: P.ink, color: P.cream, padding: '12px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Review offer</a>
          <a href="#" style={{ display: 'inline-block', background: 'transparent', color: P.ink2, padding: '12px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13, border: `1px solid ${P.rule}` }}>Compare offers</a>
        </div>
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

/* Template 5 — Password reset */
function PasswordResetEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="05 · Password reset" subject="Reset your JobDash password" preview="A link to set a new password — expires in 30 minutes.">
      <EmailHeader />
      <tr><td style={{ padding: '40px 32px 32px' }}>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: P.ink, margin: '0 0 12px' }}>Reset your password</h1>
        <p style={{ fontSize: 14, color: P.ink2, lineHeight: 1.6, margin: '0 0 24px' }}>
          Someone (hopefully you) requested a password reset for your JobDash account. Click the button below to choose a new password. This link expires in <strong style={{ color: P.ink }}>30 minutes</strong>.
        </p>
        <a href="#" style={{ display: 'inline-block', background: P.ink, color: P.cream, padding: '12px 26px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, marginBottom: 24 }}>Reset password</a>
        <div style={{ padding: 14, background: P.cream, borderRadius: 8, fontSize: 12, color: P.ink3, lineHeight: 1.55 }}>
          <strong style={{ color: P.ink }}>Didn't request this?</strong> You can safely ignore this email — your password won't change unless you click the link above. If you keep getting these emails, <a href="#" style={{ color: P.ink2 }}>contact support</a>.
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: P.ink3, marginTop: 18, wordBreak: 'break-all' }}>
          Or paste this link: jobdash.app/reset/8f3a2c91-bd4e-4fa1
        </div>
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

/* Template 6 — Application sent confirmation */
function ApplicationSentEmail() {
  const P = EMAIL_PALETTE;
  return (
    <EmailFrame label="06 · Application sent" subject="Your application to Vercel is on its way" preview="We'll let you know the moment Vercel responds.">
      <EmailHeader />
      <tr><td style={{ padding: '32px 32px 16px', textAlign: 'center' }}>
        {/* Inline illustration */}
        <svg viewBox="0 0 120 90" width="120" height="90" style={{ marginBottom: 8 }}>
          <ellipse cx="60" cy="80" rx="40" ry="4" fill="rgba(0,0,0,.06)"/>
          <rect x="30" y="32" width="60" height="40" rx="3" fill={P.cream2} stroke={P.ink} strokeWidth="1.5"/>
          <path d="M30 32 L60 56 L90 32" fill="none" stroke={P.ink} strokeWidth="1.5"/>
          <circle cx="60" cy="20" r="6" fill={P.amber}/>
          <path d="M48 18 L60 14 L72 18" fill="none" stroke={P.amber} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: P.ink, margin: '0 0 6px' }}>Application sent.</h1>
        <p style={{ fontSize: 13, color: P.ink3, margin: 0 }}>Tracked and added to your kanban as <strong style={{ color: P.ink }}>Applied</strong>.</p>
      </td></tr>
      <tr><td style={{ padding: '16px 32px 28px' }}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%', background: P.cream, borderRadius: 10, marginBottom: 16 }}><tbody>
          <tr><td style={{ padding: 18 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: P.ink3, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Application</div>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 18, fontWeight: 700, color: P.ink, letterSpacing: '-.01em' }}>Senior Software Engineer</div>
            <div style={{ fontSize: 13, color: P.ink2, marginTop: 3 }}>Vercel · Remote · Posted 5 days ago</div>
            <div style={{ height: 1, background: P.rule, margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: P.ink3 }}>
              <span><strong style={{ color: P.ink }}>Sent</strong> · Oct 22, 2:14 PM</span>
              <span>3rd application this week</span>
            </div>
          </td></tr>
        </tbody></table>
        <p style={{ fontSize: 13, color: P.ink2, lineHeight: 1.6, margin: '0 0 18px' }}>
          We'll watch for replies in your connected inbox and update your kanban automatically. If we don't hear back in 7 days, we'll remind you to follow up.
        </p>
        <a href="#" style={{ display: 'inline-block', background: P.ink, color: P.cream, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 12.5 }}>View application →</a>
      </td></tr>
      <EmailFooter />
    </EmailFrame>
  );
}

function EmailTemplatesSection() {
  return (
    <div>
      <DSSubsection title="Email Templates">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.5, maxWidth: 640 }}>
          Six transactional emails written with table-based layouts and inline styles for client compatibility.
          They share the system's typography, palette, and tone — calm, specific, never marketing-y.
        </p>
        <WelcomeEmail />
        <InterviewReminderEmail />
        <WeeklyDigestEmail />
        <OfferEmail />
        <PasswordResetEmail />
        <ApplicationSentEmail />

        <div style={{ marginTop: 8, padding: 16, background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--amber-d)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Email rules</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            <strong>Width</strong> 560px max · <strong>Tables</strong> for layout · <strong>Inline styles</strong> only<br/>
            <strong>Fallback fonts</strong> always — Archivo → sans-serif, JetBrains Mono → monospace<br/>
            <strong>Subject lines</strong> specific and human (never "Update from JobDash") · <strong>Preview text</strong> always set
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { EmailTemplatesSection });
