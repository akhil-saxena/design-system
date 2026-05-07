/* ═══ DATA GRID — polished ═══ */

const DG_COLS = [
  { key: 'company', label: 'Company', width: 150, sortable: true },
  { key: 'role', label: 'Role', width: 180, sortable: true },
  { key: 'status', label: 'Status', width: 110, sortable: true },
  { key: 'salary', label: 'Salary', width: 100, sortable: true, align: 'right' },
  { key: 'applied', label: 'Applied', width: 90, sortable: true },
  { key: 'priority', label: 'Priority', width: 90 },
];

const DG_ROWS = [
  { id: 1, company: 'Stripe', role: 'Staff Engineer', status: 'interviewing', salary: '$210k', applied: 'Mar 12', priority: 'high' },
  { id: 2, company: 'Linear', role: 'Product Engineer', status: 'applied', salary: '$185k', applied: 'Mar 14', priority: 'high' },
  { id: 3, company: 'Vercel', role: 'Senior Engineer', status: 'offer', salary: '$195k', applied: 'Mar 8', priority: 'medium' },
  { id: 4, company: 'Figma', role: 'Design Engineer', status: 'interviewing', salary: '$200k', applied: 'Mar 10', priority: 'high' },
  { id: 5, company: 'Automattic', role: 'Principal Engineer', status: 'applied', salary: '$175k', applied: 'Mar 15', priority: 'low' },
  { id: 6, company: 'Notion', role: 'Staff Engineer', status: 'rejected', salary: '$190k', applied: 'Feb 28', priority: 'medium' },
  { id: 7, company: 'Raycast', role: 'Senior Engineer', status: 'applied', salary: '$170k', applied: 'Mar 16', priority: 'medium' },
];

const DG_STATUS = { applied: { l: 'Applied', c: 'upcoming' }, interviewing: { l: 'Interview', c: 'done' }, offer: { l: 'Offer', c: 'passed' }, rejected: { l: 'Rejected', c: 'pending' } };
const DG_PRIO = { high: 'var(--red-vivid)', medium: 'var(--amber-vivid)', low: 'var(--green-vivid)' };

function DataGridSection() {
  const [sortCol, setSortCol] = React.useState('company');
  const [sortDir, setSortDir] = React.useState('asc');
  const [sel, setSel] = React.useState(new Set());
  const [widths, setWidths] = React.useState(() => Object.fromEntries(DG_COLS.map(c => [c.key, c.width])));

  const sorted = [...DG_ROWS].sort((a, b) => {
    const cmp = String(a[sortCol] || '').localeCompare(String(b[sortCol] || ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
  };

  const toggleRow = (id) => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = sel.size === DG_ROWS.length;
  const toggleAll = () => allSel ? setSel(new Set()) : setSel(new Set(DG_ROWS.map(r => r.id)));

  const onResizeStart = (key, e) => {
    e.preventDefault();
    const x0 = e.clientX, w0 = widths[key];
    const move = (e2) => setWidths(p => ({ ...p, [key]: Math.max(60, w0 + e2.clientX - x0) }));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  return (
    <div>
      <DSSubsection title="Interactive Data Grid">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Sortable columns (click header), resizable (drag column edges), selectable rows with bulk actions. Pagination in footer.
        </p>
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
          {/* Bulk action bar */}
          {sel.size > 0 && (
            <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,.05)', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 11 }}>{sel.size} selected</span>
              <button className="ds-btn ds-btn-xs">Export</button>
              <button className="ds-btn ds-btn-xs danger">Archive</button>
              <button className="ds-btn ds-btn-xs ghost" onClick={() => setSel(new Set())} style={{ marginLeft: 'auto' }}>Clear</button>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="ds-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>
                    <div className={`ds-checkbox ${allSel ? 'checked' : ''}`} style={{ width: 16, height: 16, margin: '0 auto', cursor: 'pointer' }} onClick={toggleAll}>
                      {allSel && <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                  </th>
                  {DG_COLS.map(col => (
                    <th key={col.key} style={{ width: widths[col.key], textAlign: col.align || 'left', position: 'relative', userSelect: 'none' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: col.sortable ? 'pointer' : 'default' }} onClick={() => col.sortable && toggleSort(col.key)}>
                        {col.label}
                        {sortCol === col.key && <span style={{ fontSize: 9, color: 'var(--amber)' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                      </span>
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize' }} onMouseDown={(e) => onResizeStart(col.key, e)}></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(row => {
                  const s = sel.has(row.id);
                  const st = DG_STATUS[row.status];
                  return (
                    <tr key={row.id} style={{ background: s ? 'rgba(245,158,11,.04)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <div className={`ds-checkbox ${s ? 'checked' : ''}`} style={{ width: 16, height: 16, margin: '0 auto', cursor: 'pointer' }} onClick={() => toggleRow(row.id)}>
                          {s && <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{row.company}</td>
                      <td>{row.role}</td>
                      <td><span className={`ds-badge ${st.c}`}>{st.l}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>{row.salary}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{row.applied}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: DG_PRIO[row.priority] }}></span>
                          <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{row.priority}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)' }}>{DG_ROWS.length} rows</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="ds-page-btn" disabled>‹</button>
              <button className="ds-page-btn active">1</button>
              <button className="ds-page-btn">2</button>
              <button className="ds-page-btn">›</button>
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { DataGridSection });
