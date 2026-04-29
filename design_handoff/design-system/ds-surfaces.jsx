/* ═══ CARDS, CONTAINERS, MODALS, DIALOGS, TOOLTIPS, POPOVERS ═══ */

function CardsSection() {
  return (
    <div>
      <DSSubsection title="Glass Card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="glass" style={{ padding: '20px 22px', borderRadius: 14 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Standard Glass</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>Default card with backdrop blur and translucent border.</div>
          </div>
          <div className="glass" style={{ padding: '20px 22px', borderRadius: 14, borderColor: 'rgba(245,158,11,.25)', background: 'linear-gradient(145deg,rgba(254,243,199,.5),var(--surf-1))' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Amber Accent</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>Highlighted card for CTAs or next-actions.</div>
          </div>
          <div style={{ padding: '20px 22px', borderRadius: 14, background: '#1c1917', color: '#f5f3f0' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Dark Card</div>
            <div style={{ fontSize: 13, color: '#aaa39e', lineHeight: 1.5 }}>For dark surfaces or inverted contexts.</div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Application Card (Kanban)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: 12 }}>
          <KanbanCard company="Stripe" role="Staff Engineer" logo="S" logoBg="#1a1a2e" age="5d" location="San Francisco" prio="var(--red)" />
          <KanbanCard company="Automattic" role="Experienced Software Eng…" logo="A" logoBg="#292524" age="2d" location="Remote" prio="var(--amber)" starred event="Recruiter intro · Apr 24" />
          <KanbanCard company="Supabase" role="Full Stack Engineer" logo="S" logoBg="#059669" age="2w" location="Remote" prio="var(--red)" starred event="Final round · Apr 21" />
        </div>
      </DSSubsection>

      <DSSubsection title="Sticky Note">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="ds-sticky">Reach out to David before screening. Research Jetpack vs WP.com split.<div className="ds-sticky-hint">Click to expand</div></div>
          <div className="ds-sticky" style={{ transform: 'rotate(.4deg)' }}>Prep 3 questions for Maya:<br/>- Division scope<br/>- Trial expectations<br/>- Mentorship<div className="ds-sticky-hint">3 items</div></div>
          <div className="ds-sticky" style={{ transform: 'rotate(-.8deg)' }}>Follow up if no reply by May 2.<div className="ds-sticky-hint">Reminder</div></div>
        </div>
      </DSSubsection>

      <DSSubsection title="Containers">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 14, background: 'var(--amber)', borderRadius: 2 }}></span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>Section Header</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>3 items</span>
            </div>
            <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--ink-2)' }}>Content area with header bar pattern used throughout the app.</div>
          </div>
          <div style={{ padding: 18, borderRadius: 14, border: '1.5px dashed rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-4)', fontSize: 13, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Drop zone / empty state
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

function KanbanCard({ company, role, logo, logoBg, age, location, prio, starred, event }) {
  return (
    <div className="glass" style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'box-shadow .15s, border-color .15s' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.12)'; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(145deg,${logoBg},${logoBg})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{logo}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{role}</div>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', marginTop: 2 }}>{age}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span className="ds-chip" style={{ fontSize: 10, padding: '2px 8px' }}>{location}</span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: prio }}></span>
        {starred && <span style={{ color: 'var(--amber)', fontSize: 12, marginLeft: 'auto' }}>★</span>}
      </div>
      {event && (
        <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 6, background: 'rgba(254,243,199,.5)', border: '1px solid rgba(245,158,11,.15)', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--amber-d)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {event}
        </div>
      )}
    </div>
  );
}

function ModalsSection() {
  const [modal, setModal] = React.useState(null);

  return (
    <div>
      <DSSubsection title="Modals & Dialogs">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ds-btn dark" onClick={() => setModal('add')}>Open Add Modal</button>
          <button className="ds-btn danger" onClick={() => setModal('confirm')}>Open Confirm Delete</button>
          <button className="ds-btn" onClick={() => setModal('info')}>Info Dialog</button>
        </div>
      </DSSubsection>

      {modal && (
        <div className="ds-overlay" onClick={() => setModal(null)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()} style={{ width: modal === 'confirm' ? 400 : 520 }}>
            {modal === 'add' && <>
              <div className="ds-modal-hd">
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>Add Application</span>
                <button className="ds-icbtn" onClick={() => setModal(null)} style={{ marginLeft: 'auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="ds-field"><label className="ds-label">Company</label><input className="ds-input" placeholder="e.g. Stripe" /></div>
                <div className="ds-field"><label className="ds-label">Role</label><input className="ds-input" placeholder="e.g. Staff Engineer" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="ds-field"><label className="ds-label">Location</label><input className="ds-input" placeholder="Remote" /></div>
                  <div className="ds-field"><label className="ds-label">Salary</label><input className="ds-input" placeholder="$0 – $0" /></div>
                </div>
              </div>
              <div className="ds-modal-ft">
                <button className="ds-btn" onClick={() => setModal(null)}>Cancel</button>
                <button className="ds-btn dark">Add Application</button>
              </div>
            </>}
            {modal === 'confirm' && <>
              <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Delete application?</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>This will permanently remove the Automattic application and all associated notes, documents, and timeline events.</div>
              </div>
              <div className="ds-modal-ft" style={{ justifyContent: 'center' }}>
                <button className="ds-btn" onClick={() => setModal(null)}>Cancel</button>
                <button className="ds-btn danger">Delete</button>
              </div>
            </>}
            {modal === 'info' && <>
              <div className="ds-modal-hd">
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>Keyboard Shortcuts</span>
                <button className="ds-icbtn" onClick={() => setModal(null)} style={{ marginLeft: 'auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div style={{ padding: '12px 24px 20px' }}>
                {[['⌘K', 'Search'], ['⌘N', 'New application'], ['→', 'Advance stage'], ['⌘⇧D', 'Toggle dark mode']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--rule)' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{v}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--cream-2)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{k}</span>
                  </div>
                ))}
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

function TooltipsSection() {
  const [popover, setPopover] = React.useState(false);

  return (
    <div>
      <DSSubsection title="Tooltips">
        <div style={{ display: 'flex', gap: 20, paddingTop: 10, paddingBottom: 40 }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button className="ds-icbtn ds-tooltip-trigger">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
            <div className="ds-tooltip" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 }}>Star this application</div>
          </div>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button className="ds-icbtn ds-tooltip-trigger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect></svg>
            </button>
            <div className="ds-tooltip" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 }}>Archive</div>
          </div>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <span className="ds-badge upcoming ds-tooltip-trigger" style={{ cursor: 'default' }}>Upcoming</span>
            <div className="ds-tooltip" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 }}>Scheduled for Apr 24, 2:00pm</div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Popover">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button className="ds-btn" onClick={() => setPopover(!popover)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            More actions
          </button>
          {popover && (
            <div className="ds-popover" style={{ top: '100%', left: 0, marginTop: 6 }}>
              {['Edit application', 'Duplicate', 'Move to stage…', 'Export as PDF'].map(item => (
                <div key={item} className="ds-popover-item" onClick={() => setPopover(false)}>{item}</div>
              ))}
              <div style={{ height: 1, background: 'var(--rule)', margin: '4px 0' }}></div>
              <div className="ds-popover-item" style={{ color: 'var(--red)' }} onClick={() => setPopover(false)}>Delete application</div>
            </div>
          )}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { CardsSection, ModalsSection, TooltipsSection, KanbanCard });
