/* ═══ LIGHTBOX ═══ */

function Lightbox({ open, onClose, items, idx, setIdx }) {
  if (!open) return null;
  const item = items[idx];
  const next = () => setIdx((idx + 1) % items.length);
  const prev = () => setIdx((idx - 1 + items.length) % items.length);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: 12 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      <div style={{ position: 'absolute', top: 14, left: 14, color: 'rgba(255,255,255,.7)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em' }}>{idx + 1} / {items.length}</div>

      <button onClick={prev} style={{ position: 'absolute', left: 14, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: '80%' }}>
        <div style={{ width: 380, height: 220, background: item.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
          {item.title}
        </div>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.caption}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{item.meta}</div>
        </div>
      </div>

      <button onClick={next} style={{ position: 'absolute', right: 14, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {items.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{ width: 36, height: 4, borderRadius: 2, background: i === idx ? '#fff' : 'rgba(255,255,255,.3)', cursor: 'pointer' }}></div>
        ))}
      </div>
    </div>
  );
}

function LightboxSection() {
  const items = [
    { title: 'Resume', caption: 'Senior Engineer Resume', meta: 'PDF · 2 pages · 245 KB', bg: 'linear-gradient(135deg, #f59e0b, #b45309)' },
    { title: 'Portfolio', caption: 'Design portfolio walkthrough', meta: 'Image · 1920×1080', bg: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' },
    { title: 'Cover letter', caption: 'Stripe cover letter', meta: 'PDF · 1 page · 89 KB', bg: 'linear-gradient(135deg, #15803d, #047857)' },
    { title: 'References', caption: 'Reference list', meta: 'PDF · 1 page · 45 KB', bg: 'linear-gradient(135deg, #c42020, #7f1d1d)' },
  ];
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  return (
    <div>
      <DSSubsection title="Lightbox">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Fullscreen overlay for inspecting media. Keyboard arrows navigate, Esc closes. Counter and progress strip orient the user.
        </p>

        <StateRow label="Click a thumbnail to expand">
          <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', background: 'var(--cream-2)', minHeight: 280 }}>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {items.map((it, i) => (
                <div key={i} onClick={() => { setIdx(i); setOpen(true); }} style={{ aspectRatio: '4/3', borderRadius: 8, background: it.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, transition: 'transform .15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {it.title}
                </div>
              ))}
            </div>
            <Lightbox open={open} onClose={() => setOpen(false)} items={items} idx={idx} setIdx={setIdx} />
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { Lightbox, LightboxSection });
