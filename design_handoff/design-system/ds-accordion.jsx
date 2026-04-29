/* ═══ ACCORDION / FAQ ═══ */

function AccordionItem({ q, a, open, onToggle, variant = 'default' }) {
  const isMinimal = variant === 'minimal';
  return (
    <div style={{ borderBottom: '1px solid var(--rule)', ...(isMinimal ? {} : { borderRadius: 10, border: '1px solid var(--rule)', background: 'var(--surf-2)', marginBottom: 8 }) }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMinimal ? '14px 4px' : '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{q}</div>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ink-3)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height .25s ease' }}>
        <div style={{ padding: isMinimal ? '0 4px 14px' : '0 16px 14px', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{a}</div>
      </div>
    </div>
  );
}

function AccordionSection() {
  const [open1, setOpen1] = React.useState(0);
  const [openSet, setOpenSet] = React.useState(new Set([0, 2]));
  const [openMin, setOpenMin] = React.useState(0);

  const faqs = [
    { q: 'How does JobDash track applications?', a: 'You add an application once — company, role, link, status. JobDash auto-fills public details and surfaces follow-up reminders based on the stage.' },
    { q: 'Can I import from LinkedIn or Indeed?', a: 'Yes. Paste a job URL and we auto-extract title, company, salary range, and description into a draft application.' },
    { q: 'Is my data private?', a: 'Your data is yours. We never sell it or share it with employers. Export anytime as CSV or JSON.' },
    { q: 'Does JobDash work with my browser/email?', a: 'Optional Chrome extension captures applications from any site. Email forwarding to JobDash auto-creates entries.' },
  ];

  const toggleSet = (i) => {
    const ns = new Set(openSet);
    ns.has(i) ? ns.delete(i) : ns.add(i);
    setOpenSet(ns);
  };

  return (
    <div>
      <DSSubsection title="Accordion / FAQ">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Collapsible content blocks. Use single-open mode for FAQs, multi-open for settings groups.
        </p>

        <StateRow label="Single-open — only one section expanded at a time">
          <div style={{ width: '100%' }}>
            {faqs.map((f, i) => (
              <AccordionItem key={i} q={f.q} a={f.a} open={open1 === i} onToggle={() => setOpen1(open1 === i ? -1 : i)} />
            ))}
          </div>
        </StateRow>

        <StateRow label="Multi-open — for settings or filter groups">
          <div style={{ width: '100%' }}>
            {faqs.map((f, i) => (
              <AccordionItem key={i} q={f.q} a={f.a} open={openSet.has(i)} onToggle={() => toggleSet(i)} />
            ))}
          </div>
        </StateRow>

        <StateRow label="Minimal — borderless, for inline FAQs">
          <div style={{ width: '100%' }}>
            {faqs.slice(0, 3).map((f, i) => (
              <AccordionItem key={i} q={f.q} a={f.a} open={openMin === i} onToggle={() => setOpenMin(openMin === i ? -1 : i)} variant="minimal" />
            ))}
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { AccordionItem, AccordionSection });
