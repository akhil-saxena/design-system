/* ═══ CLICK-TO-COPY ═══ */

function CopyButton({ value, children, variant = 'inline' }) {
  const [copied, setCopied] = React.useState(false);
  const onClick = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (variant === 'icon') {
    return (
      <button className="ds-icbtn" onClick={onClick} title={copied ? 'Copied!' : 'Copy'} style={{ color: copied ? 'var(--green)' : undefined }}>
        {copied ? (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        )}
      </button>
    );
  }

  if (variant === 'field') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--rule)', borderRadius: 8, background: 'var(--surf-3)', overflow: 'hidden', width: '100%' }}>
        <code style={{ flex: 1, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</code>
        <button onClick={onClick} style={{ padding: '8px 12px', borderLeft: '1px solid var(--rule)', background: copied ? 'rgba(34,197,94,.1)' : 'transparent', border: 'none', borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: 'var(--rule)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copied ? 'var(--green)' : 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    );
  }

  // inline
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--rule)', background: copied ? 'rgba(34,197,94,.1)' : 'var(--surf-3)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copied ? 'var(--green)' : 'var(--ink-2)', fontFamily: 'var(--mono)' }}>
      {copied ? '✓ Copied!' : children || value}
    </button>
  );
}

function CopyPasteSection() {
  return (
    <div>
      <DSSubsection title="Click to Copy">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Tiny gesture, big quality-of-life win. Always confirm visually — a check icon, a label flip, a brief color shift — so the user knows the click landed.
        </p>

        <StateRow label="Inline pill — for short tokens">
          <CopyButton value="#f59e0b">
            <code style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }}></span>#f59e0b
            </code>
          </CopyButton>
          <CopyButton value="--amber" />
          <CopyButton value="JD-7821-A4" />
        </StateRow>

        <StateRow label="Field with copy button — for URLs and snippets">
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CopyButton variant="field" value="https://jobdash.app/share/abc123xyz" />
            <CopyButton variant="field" value="npm install @jobdash/sdk" />
            <CopyButton variant="field" value="curl -X POST https://api.jobdash.app/v1/applications -H 'Authorization: Bearer …'" />
          </div>
        </StateRow>

        <StateRow label="Icon button — for adjacent actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--surf-2)', border: '1px solid var(--rule)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)' }}>jobdash@example.com</span>
            <CopyButton variant="icon" value="jobdash@example.com" />
          </div>
        </StateRow>

        <StateRow label="In context — color token grid">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%' }}>
            {[
              { name: '--amber', val: '#f59e0b' },
              { name: '--blue', val: '#1d4ed8' },
              { name: '--green', val: '#15803d' },
              { name: '--red', val: '#c42020' },
            ].map(c => (
              <div key={c.name} style={{ borderRadius: 8, border: '1px solid var(--rule)', padding: 10, background: 'var(--surf-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: c.val }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                  <CopyButton variant="icon" value={c.val} />
                </div>
              </div>
            ))}
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { CopyButton, CopyPasteSection });
