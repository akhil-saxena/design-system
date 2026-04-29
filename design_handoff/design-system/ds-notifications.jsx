/* ═══ NOTIFICATION CENTER — polished ═══ */

const NOTIF_DATA = [
  { id: 1, type: 'success', title: 'Application submitted', desc: 'Stripe — Staff Engineer application was sent.', time: '2m ago', read: false },
  { id: 2, type: 'info', title: 'Interview scheduled', desc: 'Linear — Technical interview Mar 28, 2:00 PM.', time: '1h ago', read: false },
  { id: 3, type: 'warning', title: 'Deadline approaching', desc: 'Vercel take-home due in 2 days.', time: '3h ago', read: false },
  { id: 4, type: 'info', title: 'New recruiter message', desc: 'Sarah from Figma sent you a note about next steps.', time: '5h ago', read: true },
  { id: 5, type: 'error', title: 'Posting closed', desc: 'Notion — Senior Engineer has been filled.', time: '1d ago', read: true },
  { id: 6, type: 'success', title: 'Advanced to final round', desc: 'Automattic — You\'re in the onsite stage.', time: '2d ago', read: true },
];

function NIcon({ type, size = 14 }) {
  const s = { width: size, height: size };
  switch (type) {
    case 'success': return <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" {...s}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    case 'warning': return <svg viewBox="0 0 24 24" fill="none" stroke="var(--amber-d)" strokeWidth="2" {...s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
    case 'error': return <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" {...s}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
    default: return <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" {...s}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
  }
}

const TYPE_BG = { success: 'rgba(34,197,94,.1)', warning: 'rgba(245,158,11,.1)', error: 'rgba(239,68,68,.1)', info: 'rgba(59,130,246,.1)' };

function NotificationCenterSection() {
  const [notifs, setNotifs] = React.useState(NOTIF_DATA);
  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  return (
    <div>
      <DSSubsection title="Notification Center Panel">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Bell dropdown with grouped notifications. Unread items have an amber dot and bolder text. Dismiss individual items or mark all read.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>Notifications</span>
                {unread > 0 && <span className="ds-notif-count">{unread}</span>}
              </div>
              <button className="ds-btn ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={markAllRead}>Mark all read</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifs.map(n => (
                <div key={n.id} className="ds-notif-item" style={{ opacity: n.read ? .55 : 1 }}>
                  <div className="ds-notif-icon-wrap" style={{ background: TYPE_BG[n.type] }}>
                    <NIcon type={n.type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: n.read ? 500 : 600, fontSize: 12.5 }}>{n.title}</span>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }}></span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.desc}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', marginTop: 4 }}>{n.time}</div>
                  </div>
                  <button className="ds-icbtn" style={{ width: 24, height: 24, flexShrink: 0 }} onClick={() => dismiss(n.id)} title="Dismiss">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
              {notifs.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>All caught up!</div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Inline banners</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { type: 'info', title: 'New feature', desc: 'Import applications from LinkedIn.' },
                { type: 'success', title: 'Profile updated', desc: 'Your resume has been saved.' },
                { type: 'warning', title: 'Incomplete profile', desc: 'Add a phone number for reminders.' },
                { type: 'error', title: 'Sync failed', desc: 'Unable to connect to email.' },
              ].map((b, i) => (
                <div key={i} className={`ds-inline-banner ds-inline-banner-${b.type}`}>
                  <div className="ds-notif-icon-wrap" style={{ background: TYPE_BG[b.type], width: 28, height: 28 }}>
                    <NIcon type={b.type} size={13} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{b.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{b.desc}</div>
                  </div>
                  <button className="ds-icbtn" style={{ width: 24, height: 24 }}>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { NotificationCenterSection });
