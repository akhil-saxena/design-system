/* ═══ SIDEBAR, TREE NAV & COLLAPSIBLE NAV ═══ */

function TreeItem({ label, icon, children, depth = 0, defaultOpen = false, active = false, badge, count }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasChildren = children && React.Children.count(children) > 0;
  const pad = 14 + depth * 18;

  return (
    <div>
      <div
        className={`ds-tree-item ${active ? 'active' : ''}`}
        style={{ paddingLeft: pad }}
        onClick={() => hasChildren ? setOpen(!open) : null}
      >
        {hasChildren ? (
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transition: 'transform .2s ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0, opacity: .5 }}>
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        ) : (
          <span style={{ width: 11, flexShrink: 0 }}></span>
        )}
        {icon && <span style={{ display: 'flex', color: active ? 'var(--amber)' : 'var(--ink-4)', transition: 'color .15s' }}>{icon}</span>}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {badge && <span className="ds-tree-badge">{badge}</span>}
        {count !== undefined && <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)', fontWeight: 600 }}>{count}</span>}
      </div>
      {hasChildren && (
        <div style={{ height: open ? 'auto' : 0, overflow: 'hidden', transition: 'height .15s ease' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible Sidebar ─── */
function CollapsibleSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Dashboard');
  const w = collapsed ? 56 : 220;

  const items = [
    { label: 'Dashboard', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg> },
    { label: 'Applications', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>, badge: '24' },
    { label: 'Calendar', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { label: 'Contacts', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg> },
    { label: 'Analytics', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M7 12l4-4 4 4 6-6"></path></svg> },
    { label: 'Settings', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
  ];

  return (
    <div className="ds-collapsible-sidebar glass" style={{ width: w, transition: 'width .25s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 380 }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 14px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: '#fff' }}>J</span>
        </div>
        {!collapsed && <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>JobDash</span>}
      </div>

      {/* Items */}
      <div style={{ flex: 1, padding: '6px 6px', overflowY: 'auto' }}>
        {items.map(item => (
          <div
            key={item.label}
            className={`ds-collapsible-item ${activeItem === item.label ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '8px 10px' }}
            onClick={() => setActiveItem(item.label)}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                {item.badge && <span className="ds-tree-badge">{item.badge}</span>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: '8px 6px', borderTop: '1px solid var(--rule)', flexShrink: 0, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <button className="ds-icbtn" style={{ width: 28, height: 28 }} onClick={() => setCollapsed(!collapsed)}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transition: 'transform .25s', transform: collapsed ? 'rotate(180deg)' : '' }}>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

function SidebarNavSection() {
  const folderIcon = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
  const fileIcon = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
  const starIcon = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
  const homeIcon = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>;
  const settingsIcon = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

  return (
    <div>
      <DSSubsection title="Collapsible Sidebar">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Click the chevron at the bottom to collapse. Icons remain visible; labels and badges hide. Tooltip on hover when collapsed.
        </p>
        <CollapsibleSidebar />
      </DSSubsection>

      <DSSubsection title="Tree Navigation">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Nested expandable tree with depth indentation, chevron rotation, and optional badges/counts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="glass" style={{ borderRadius: 14, padding: '8px 0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 8px', fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', fontWeight: 600 }}>Workspace</div>
            <TreeItem label="Dashboard" icon={homeIcon} active />
            <TreeItem label="Applications" icon={folderIcon} defaultOpen badge="24">
              <TreeItem label="Active" depth={1} count={12} />
              <TreeItem label="Archived" depth={1} count={8} />
              <TreeItem label="Drafts" depth={1} count={4} />
            </TreeItem>
            <TreeItem label="Saved Jobs" icon={starIcon} badge="6" />
            <TreeItem label="Documents" icon={folderIcon}>
              <TreeItem label="Resumes" icon={fileIcon} depth={1} />
              <TreeItem label="Cover Letters" icon={fileIcon} depth={1} />
              <TreeItem label="References" icon={fileIcon} depth={1} />
            </TreeItem>
            <TreeItem label="Settings" icon={settingsIcon} />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Flat sidebar</div>
            <div className="glass" style={{ borderRadius: 14, padding: '8px 0', overflow: 'hidden' }}>
              {[
                { label: 'Overview', active: true },
                { label: 'Board View' },
                { label: 'Calendar' },
                { label: 'Analytics', badge: 'New' },
                { label: 'Contacts' },
              ].map((item, i) => (
                <div key={i} className={`ds-tree-item ${item.active ? 'active' : ''}`} style={{ paddingLeft: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.active ? 'var(--amber)' : 'var(--ink-5)', flexShrink: 0 }}></span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span className="ds-badge upcoming" style={{ fontSize: 8, padding: '1px 6px' }}>{item.badge}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { SidebarNavSection });
