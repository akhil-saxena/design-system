/* ═══ RICH TEXT EDITOR — polished ═══ */

function RTEBtn({ icon, label, active, disabled, onClick }) {
  return (
    <button
      className={`ds-rte-btn ${active ? 'active' : ''}`}
      style={{ opacity: disabled ? .3 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      onClick={onClick}
      title={label}
    >{icon}</button>
  );
}

function RichTextToolbar({ activeFormats = {} }) {
  const bold = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"></path></svg>;
  const italic = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>;
  const underline = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>;
  const strike = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"></line><path d="M17.5 7.5c0-2-1.5-3.5-5.5-3.5s-5.5 1.5-5.5 3.5c0 4 11 4 11 8 0 2-1.5 3.5-5.5 3.5s-5.5-1.5-5.5-3.5"></path></svg>;
  const heading = <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'var(--display)' }}>H</span>;
  const ul = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="5" cy="6" r="1" fill="currentColor"></circle><circle cx="5" cy="12" r="1" fill="currentColor"></circle><circle cx="5" cy="18" r="1" fill="currentColor"></circle></svg>;
  const ol = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line></svg>;
  const link = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
  const code = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;

  return (
    <div className="ds-rte-toolbar">
      <RTEBtn icon={bold} label="Bold" active={activeFormats.bold} />
      <RTEBtn icon={italic} label="Italic" active={activeFormats.italic} />
      <RTEBtn icon={underline} label="Underline" />
      <RTEBtn icon={strike} label="Strikethrough" />
      <div className="ds-rte-sep"></div>
      <RTEBtn icon={heading} label="Heading" />
      <RTEBtn icon={ul} label="Bullet list" />
      <RTEBtn icon={ol} label="Numbered list" />
      <div className="ds-rte-sep"></div>
      <RTEBtn icon={link} label="Link" />
      <RTEBtn icon={code} label="Code" />
    </div>
  );
}

function RichTextEditorSection() {
  return (
    <div>
      <DSSubsection title="Rich Text Editor">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Formatting toolbar with bold/italic/lists/links. Includes word count footer and save action. Minimal variant omits the toolbar.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Full */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <RichTextToolbar activeFormats={{ bold: true }} />
            <div className="ds-richtext-body" contentEditable suppressContentEditableWarning>
              <p>Write your <b>cover letter</b> here. Highlight key achievements and explain why you're excited about the role.</p>
              <ul>
                <li>Led migration of legacy system to <b>React</b></li>
                <li>Reduced page load time by 40%</li>
                <li>Mentored 3 junior engineers</li>
              </ul>
              <p>Looking forward to discussing how I can contribute to your <a href="#" style={{ color: 'var(--amber-d)', textDecoration: 'underline' }}>engineering team</a>.</p>
            </div>
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)' }}>142 words</span>
              <button className="ds-btn amber ds-btn-sm">Save Draft</button>
            </div>
          </div>

          {/* Minimal + states */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Minimal variant</div>
              <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div className="ds-richtext-body" contentEditable suppressContentEditableWarning style={{ minHeight: 80, fontSize: 13 }}>
                  <p>Quick notes about this application…</p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Toolbar button states</div>
              <div className="glass" style={{ borderRadius: 14, padding: 12 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <RTEBtn icon={<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"></path></svg>} label="Active" active />
                  <RTEBtn icon={<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>} label="Default" />
                  <RTEBtn icon={<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>} label="Disabled" disabled />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', marginTop: 8, display: 'flex', gap: 32 }}>
                  <span>Active</span><span>Default</span><span>Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { RichTextEditorSection });
