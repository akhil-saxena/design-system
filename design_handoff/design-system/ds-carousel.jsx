/* ═══ CAROUSEL / SLIDER ═══ */

function Carousel({ items, variant = 'image' }) {
  const [idx, setIdx] = React.useState(0);
  const total = items.length;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ overflow: 'hidden', borderRadius: 12, position: 'relative', aspectRatio: variant === 'image' ? '16/9' : 'auto', minHeight: variant === 'image' ? 'auto' : 160 }}>
        <div style={{ display: 'flex', transition: 'transform .35s cubic-bezier(.4,.2,.2,1)', transform: `translateX(-${idx * 100}%)`, height: '100%' }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex: '0 0 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.bg || 'var(--cream-2)', color: item.fg || 'var(--ink)', padding: 24 }}>
              {variant === 'image' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>{item.subtitle}</div>
                </div>
              ) : (
                <div style={{ width: '100%', textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>{item.body}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setIdx((idx - 1 + total) % total)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.92)', border: '1px solid var(--rule)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={() => setIdx((idx + 1) % total)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.92)', border: '1px solid var(--rule)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {items.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? 'var(--amber)' : 'var(--ink-5)', cursor: 'pointer', transition: 'all .2s' }}></div>
        ))}
      </div>
    </div>
  );
}

function CardCarousel() {
  const cards = [
    { co: 'Stripe', role: 'Staff Engineer', loc: 'SF', bg: '#635bff' },
    { co: 'Linear', role: 'Sr Designer', loc: 'Remote', bg: '#5e6ad2' },
    { co: 'Vercel', role: 'Frontend Lead', loc: 'NY', bg: '#000' },
    { co: 'Figma', role: 'Product Eng', loc: 'SF', bg: '#f24e1e' },
    { co: 'Notion', role: 'PM', loc: 'NY', bg: '#000' },
  ];
  const ref = React.useRef(null);
  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8, scrollbarWidth: 'thin' }}>
        {cards.map((c, i) => (
          <div key={i} style={{ flex: '0 0 200px', scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <div style={{ height: 80, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18 }}>{c.co}</div>
            <div style={{ padding: 12, background: 'var(--cream)' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.role}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{c.loc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button className="ds-icbtn" onClick={() => ref.current?.scrollBy({ left: -220, behavior: 'smooth' })}>‹</button>
        <button className="ds-icbtn" onClick={() => ref.current?.scrollBy({ left: 220, behavior: 'smooth' })}>›</button>
      </div>
    </div>
  );
}

function CarouselSection() {
  return (
    <div>
      <DSSubsection title="Carousel & Slider">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Sequential content browsers. Use sparingly — when content is genuinely sequential and there's value in a temporal reveal.
        </p>
        <StateRow label="Hero carousel — full slides">
          <div style={{ width: '100%' }}>
            <Carousel items={[
              { title: 'Welcome to JobDash', subtitle: 'The job hunt, with sanity intact', bg: 'linear-gradient(135deg, #f59e0b, #b45309)', fg: '#fff' },
              { title: 'Track every application', subtitle: 'Kanban, list, calendar — your call', bg: 'var(--ink)', fg: 'var(--cream)' },
              { title: 'Never miss a follow-up', subtitle: 'Smart reminders for every stage', bg: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', fg: '#fff' },
            ]} />
          </div>
        </StateRow>
        <StateRow label="Content carousel — quotes/testimonials">
          <div style={{ width: '100%' }}>
            <Carousel variant="content" items={[
              { label: 'Testimonial', title: '"Got my dream job in 6 weeks."', body: 'JobDash kept me organized through 47 applications and 12 interviews.' },
              { label: 'Case study', title: '"Cut my apply time by 70%"', body: 'Templates, snippets, and a tracking workflow that actually works.' },
              { label: 'Review', title: '"The only tool I needed."', body: 'Replaced my spreadsheet, my Notion docs, and my Google Calendar reminders.' },
            ]} />
          </div>
        </StateRow>
        <StateRow label="Card carousel — horizontal scroll">
          <div style={{ width: '100%' }}>
            <CardCarousel />
          </div>
        </StateRow>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { Carousel, CardCarousel, CarouselSection });
