/* ═══ TYPOGRAPHY SPECIMENS ═══ */

function TypeSpecSection() {
  return (
    <div>
      <DSSubsection title="Typography Specimens">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Long-form text patterns. These are the building blocks for help articles, blog posts, and any rendered prose.
        </p>

        <div className="glass" style={{ borderRadius: 12, padding: 28, maxWidth: 640 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Article · 4 min read</div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 32, letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 8 }}>How to write a follow-up that lands</h1>
          <p style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 20 }}>
            The 24-hour window after an interview is a conversation, not a transaction. Here's the framework that works.
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--rule)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>JS</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Jordan Saito</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Career writer · Apr 2026</div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', marginTop: 24, marginBottom: 10 }}>Start with what you noticed</h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 14 }}>
            A great follow-up doesn't restate your qualifications. It picks one specific moment from the conversation and builds on it. Maybe the interviewer mentioned a migration they're stuck on, or a hiring goal that's been moving slowly. That's your hook.
          </p>

          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 18 }}>
            Generic follow-ups read as templates. Specific ones read as continuing the conversation — and that's exactly what you want them to feel like.
          </p>

          <blockquote style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 18, margin: '20px 0', fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, color: 'var(--ink)' }}>
            "I keep thinking about the deploy bottleneck you mentioned. I shipped a similar fix at my last role — happy to send the postmortem if useful."
            <footer style={{ fontStyle: 'normal', fontSize: 12, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--font)' }}>— from a real follow-up that landed an offer</footer>
          </blockquote>

          <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, marginTop: 24, marginBottom: 8 }}>The four-line structure</h3>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 14 }}>
            Keep it tight. Long follow-ups feel like homework. Try this:
          </p>

          <ol style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', marginLeft: 20, marginBottom: 18 }}>
            <li>Reference one specific thing from the call</li>
            <li>Add one piece of value — a link, an idea, an offer</li>
            <li>Close with a forward-looking question</li>
            <li>Sign off without apology</li>
          </ol>

          <div style={{ background: 'var(--cream-2)', borderRadius: 8, padding: 14, marginTop: 18, marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--amber-d)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Pro tip</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
              Send within 24 hours but not within 24 minutes. Too fast reads as anxious; too slow reads as forgotten.
            </p>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 14 }}>
            Tools matter, too. Use <code style={{ fontFamily: 'var(--mono)', fontSize: 13, background: 'var(--cream-2)', padding: '1px 6px', borderRadius: 4 }}>Cmd+Shift+T</code> in JobDash to open the follow-up template, or hit <span className="ds-kbd" style={{ fontSize: 11 }}>F</span> from the application list.
          </p>

          <pre style={{ background: '#1c1917', color: '#f5f3f0', padding: 14, borderRadius: 8, fontSize: 12, fontFamily: 'var(--mono)', lineHeight: 1.5, overflow: 'auto', marginBottom: 18 }}>{`Subject: Quick follow-up on yesterday

Hi Anya,

Thinking about the deploy bottleneck — I'd love
to share what worked when we hit it. Free Friday?

— Jordan`}</pre>

          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '24px 0' }} />
          <p style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.5 }}>Footnote: Adjust tone for late-stage interviews. Closer to the offer, lean warmer.</p>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { TypeSpecSection });
