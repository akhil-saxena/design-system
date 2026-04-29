/* ═══ EDITABLE — Editable table, kanban cross-column drag, rich text mini editor ═══ */

/* ─── Editable Table ─── */
function EditableTableSection() {
  const [data, setData] = React.useState([
    { id: 1, company: 'Automattic', role: 'Experienced Software Engineer', salary: '$70K–170K', stage: 'Applied' },
    { id: 2, company: 'Stripe', role: 'Staff Engineer, Payments', salary: '$180K–260K', stage: 'Wishlist' },
    { id: 3, company: 'Linear', role: 'Product Engineer', salary: '$140K–200K', stage: 'Applied' },
    { id: 4, company: 'Supabase', role: 'Full Stack Engineer', salary: '$120K–180K', stage: 'Interviewing' },
  ]);
  const [editing, setEditing] = React.useState(null); // {id, field}
  const [editVal, setEditVal] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const startEdit = (id, field) => {
    const row = data.find(r => r.id === id);
    setEditing({ id, field });
    setEditVal(row[field]);
  };

  const commitEdit = () => {
    if (!editing) return;
    setData(d => d.map(r => r.id === editing.id ? { ...r, [editing.field]: editVal } : r));
    setEditing(null);
  };

  const cancelEdit = () => { setEditing(null); };

  const fields = ['company', 'role', 'salary', 'stage'];

  return (
    <DSSubsection title="Editable Table">
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Double-click any cell to edit inline. Enter to commit, Escape to cancel. Cell highlights on focus.</p>
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <table className="ds-table">
          <thead>
            <tr>
              {fields.map(f => <th key={f}>{f}</th>)}
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                {fields.map(f => (
                  <td key={f} onDoubleClick={() => startEdit(row.id, f)} style={{ cursor: 'text', position: 'relative' }}>
                    {editing && editing.id === row.id && editing.field === f ? (
                      <input ref={inputRef} className="ds-cell-edit" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); if (e.key === 'Tab') { e.preventDefault(); commitEdit(); const fi = fields.indexOf(f); if (fi < fields.length - 1) startEdit(row.id, fields[fi + 1]); } }}
                      />
                    ) : (
                      <span className="ds-cell-display" style={{ fontWeight: f === 'company' ? 600 : 400, fontFamily: f === 'salary' ? 'var(--mono)' : 'inherit', fontSize: f === 'salary' ? 12 : 13 }}>
                        {f === 'stage' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: { Wishlist: 'var(--ink-4)', Applied: 'var(--blue)', Screening: 'var(--purple)', Interviewing: 'var(--amber)', Offer: 'var(--green)' }[row[f]] || 'var(--ink-5)', display: 'inline-block', marginRight: 6 }}></span>}
                        {row[f]}
                      </span>
                    )}
                  </td>
                ))}
                <td>
                  <button className="ds-icbtn" style={{ width: 24, height: 24, opacity: .4 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DSSubsection>
  );
}

/* ─── Kanban Cross-Column Drag ─── */
function KanbanSection() {
  const [columns, setColumns] = React.useState({
    wishlist: [{ id: 'w1', company: 'Stripe', role: 'Staff Engineer' }],
    applied: [{ id: 'a1', company: 'Automattic', role: 'Senior SWE' }, { id: 'a2', company: 'Linear', role: 'Product Engineer' }],
    screening: [{ id: 's1', company: 'Raycast', role: 'macOS Engineer' }],
    interview: [{ id: 'i1', company: 'Supabase', role: 'Full Stack' }],
  });
  const [dragging, setDragging] = React.useState(null); // { col, idx }
  const [overCol, setOverCol] = React.useState(null);

  const colMeta = {
    wishlist: { label: 'Wishlist', color: 'var(--ink-4)' },
    applied: { label: 'Applied', color: 'var(--blue)' },
    screening: { label: 'Screening', color: 'var(--purple)' },
    interview: { label: 'Interviewing', color: 'var(--amber)' },
  };

  const onDrop = (targetCol) => {
    if (!dragging || dragging.col === targetCol) { setDragging(null); setOverCol(null); return; }
    setColumns(prev => {
      const src = [...prev[dragging.col]];
      const [item] = src.splice(dragging.idx, 1);
      const dest = [...prev[targetCol], item];
      return { ...prev, [dragging.col]: src, [targetCol]: dest };
    });
    setDragging(null);
    setOverCol(null);
  };

  return (
    <DSSubsection title="Kanban with Cross-Column Drag">
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Drag cards between columns to change stage. Column highlights when a card hovers over it.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        {Object.keys(colMeta).map(colKey => (
          <div key={colKey}
            onDragOver={e => { e.preventDefault(); setOverCol(colKey); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => onDrop(colKey)}
            style={{
              flex: '1 1 0', minWidth: 160, borderRadius: 12, padding: 8,
              background: overCol === colKey && dragging && dragging.col !== colKey ? 'rgba(245,158,11,.06)' : 'rgba(0,0,0,.02)',
              border: overCol === colKey && dragging && dragging.col !== colKey ? '1.5px dashed var(--amber)' : '1.5px dashed transparent',
              transition: 'all .15s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colMeta[colKey].color }}></span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12 }}>{colMeta[colKey].label}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, background: 'var(--cream-2)', color: 'var(--ink-3)', borderRadius: 8, padding: '1px 6px', fontWeight: 700, marginLeft: 'auto' }}>{columns[colKey].length}</span>
            </div>
            {columns[colKey].map((item, idx) => (
              <div key={item.id} draggable
                onDragStart={() => setDragging({ col: colKey, idx })}
                onDragEnd={() => { setDragging(null); setOverCol(null); }}
                className="glass" style={{
                  padding: '8px 10px', borderRadius: 8, marginBottom: 6, cursor: 'grab', display: 'flex', gap: 8, alignItems: 'center',
                  opacity: dragging && dragging.col === colKey && dragging.idx === idx ? .4 : 1,
                  transition: 'opacity .1s',
                }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--ink)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 10, flexShrink: 0 }}>{item.company[0]}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.company}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.role}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '8px', borderRadius: 8, border: '1px dashed rgba(0,0,0,.08)', textAlign: 'center', fontSize: 11, color: 'var(--ink-4)', cursor: 'pointer' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber-d)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,.08)'; e.currentTarget.style.color = 'var(--ink-4)'; }}>
              + Add
            </div>
          </div>
        ))}
      </div>
    </DSSubsection>
  );
}

/* ─── Rich Text Mini Editor ─── */
function RichTextSection() {
  const editorRef = React.useRef(null);
  const [wordCount, setWordCount] = React.useState(0);

  const exec = (cmd, val) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const updateCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText.trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    }
  };

  React.useEffect(() => { updateCount(); }, []);

  const ToolBtn = ({ cmd, icon, label }) => (
    <button className="ds-icbtn" style={{ width: 28, height: 28 }} onClick={() => exec(cmd)} title={label}>{icon}</button>
  );

  return (
    <DSSubsection title="Rich Text Mini Editor">
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>Toolbar with bold, italic, list, link. Uses contentEditable — suitable for notes and short-form text.</p>
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 520 }}>
        {/* Toolbar */}
        <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <ToolBtn cmd="bold" label="Bold" icon={<span style={{ fontWeight: 800, fontSize: 13 }}>B</span>} />
          <ToolBtn cmd="italic" label="Italic" icon={<span style={{ fontStyle: 'italic', fontSize: 13 }}>I</span>} />
          <ToolBtn cmd="underline" label="Underline" icon={<span style={{ textDecoration: 'underline', fontSize: 13 }}>U</span>} />
          <div style={{ width: 1, height: 20, background: 'var(--rule)', alignSelf: 'center', margin: '0 2px' }}></div>
          <ToolBtn cmd="insertUnorderedList" label="Bullet list" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line></svg>} />
          <ToolBtn cmd="insertOrderedList" label="Numbered list" icon={<span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700 }}>1.</span>} />
          <div style={{ width: 1, height: 20, background: 'var(--rule)', alignSelf: 'center', margin: '0 2px' }}></div>
          <button className="ds-icbtn" style={{ width: 28, height: 28 }} title="Link"
            onClick={() => { const url = prompt('Enter URL:'); if (url) exec('createLink', url); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </button>
        </div>
        {/* Editor */}
        <div ref={editorRef} contentEditable className="ds-richtext-body" onInput={updateCount}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: 'Reach out to <b>David Swanson</b> before the screening call. Key topics:<br><ul><li>Ask about the <b>Division structure</b> and team rotation</li><li>Clarify trial project expectations</li><li>Research <i>Jetpack vs WP.com</i> architecture split</li></ul>' }}>
        </div>
        {/* Footer */}
        <div style={{ padding: '6px 12px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)' }}>{wordCount} words</span>
          <button className="ds-btn" style={{ fontSize: 10, padding: '3px 10px' }}>Save note</button>
        </div>
      </div>
    </DSSubsection>
  );
}

function EditableSection() {
  return (
    <div>
      <EditableTableSection />
      <KanbanSection />
      <RichTextSection />
    </div>
  );
}

Object.assign(window, { EditableSection });
