/* ═══ APP SHELL — sidebar nav + section rendering ═══ */

const SECTIONS = [
  { id: 'cover', label: 'Overview', icon: 'card', group: 'Start here' },
  { id: 'screens', label: 'Sample Screens', icon: 'sheet', group: 'Start here' },
  { id: 'emails', label: 'Email Templates', icon: 'bell', group: 'Start here' },
  { id: 'mobile', label: 'Mobile Views', icon: 'card', group: 'Start here' },
  { id: 'status', label: 'Status Pages', icon: 'card', group: 'Start here' },
  { id: 'tokenexport', label: 'Token Export', icon: 'sheet', group: 'Start here' },
  { id: 'a11y', label: 'Accessibility', icon: 'avatar', group: 'Start here' },
  { id: 'tokens', label: 'Design Tokens', icon: 'palette', group: 'Foundation' },
  { id: 'buttons', label: 'Buttons & CTAs', icon: 'pointer', group: 'Inputs' },
  { id: 'inputs', label: 'Inputs & Selects', icon: 'text', group: 'Inputs' },
  { id: 'controls', label: 'Checkboxes & Toggles', icon: 'toggle', group: 'Inputs' },
  { id: 'datepicker', label: 'Date & Time Picker', icon: 'calendar', group: 'Inputs' },
  { id: 'chips', label: 'Chips, Badges & Sliders', icon: 'tag', group: 'Inputs' },
  { id: 'cards', label: 'Cards & Containers', icon: 'card', group: 'Surfaces' },
  { id: 'modals', label: 'Modals & Dialogs', icon: 'modal', group: 'Surfaces' },
  { id: 'tooltips', label: 'Tooltips & Popovers', icon: 'tooltip', group: 'Surfaces' },
  { id: 'tables', label: 'Tables', icon: 'table', group: 'Data' },
  { id: 'tabs', label: 'Tabs & Navigation', icon: 'tabs', group: 'Data' },
  { id: 'dragdrop', label: 'Drag & Drop', icon: 'drag', group: 'Data' },
  { id: 'feedback', label: 'Toasts & Progress', icon: 'bell', group: 'Feedback' },
  { id: 'avatars', label: 'Avatars & Presence', icon: 'avatar', group: 'Feedback' },
  { id: 'advanced', label: 'Command Palette & More', icon: 'search', group: 'Advanced' },
  { id: 'patterns', label: 'Patterns & Flows', icon: 'flow', group: 'Advanced' },
  { id: 'fileupload', label: 'File Upload', icon: 'upload', group: 'Advanced' },
  { id: 'interactions', label: 'Sheets & Actions', icon: 'sheet', group: 'Interaction' },
  { id: 'dataviz', label: 'Data Visualization', icon: 'chart', group: 'Interaction' },
  { id: 'editable', label: 'Editable & Kanban', icon: 'edit', group: 'Interaction' },
  { id: 'sidenav', label: 'Sidebar & Tree Nav', icon: 'flow', group: 'Navigation' },
  { id: 'wizard', label: 'Stepper & Wizard', icon: 'flow', group: 'Navigation' },
  { id: 'emptystates', label: 'Empty States', icon: 'card', group: 'Navigation' },
  { id: 'notifications', label: 'Notification Center', icon: 'bell', group: 'Navigation' },
  { id: 'searchauto', label: 'Search & Autocomplete', icon: 'search', group: 'Navigation' },
  { id: 'datagrid', label: 'Data Grid', icon: 'table', group: 'Data Display' },
  { id: 'calendarview', label: 'Calendar View', icon: 'calendar', group: 'Data Display' },
  { id: 'richtexteditor', label: 'Rich Text Editor', icon: 'edit', group: 'Data Display' },
  { id: 'colorpicker', label: 'Color Picker', icon: 'palette', group: 'Data Display' },
  { id: 'segmented', label: 'Segmented Control', icon: 'toggle', group: 'Data Display' },
  { id: 'universal', label: 'Stats, Skeletons & More', icon: 'chart', group: 'Universal' },
  { id: 'coachmarks', label: 'Onboarding Coach Marks', icon: 'pointer', group: 'Universal' },
  { id: 'mediacards', label: 'Image & Media Cards', icon: 'card', group: 'Universal' },
  { id: 'formvalidation', label: 'Form Validation', icon: 'text', group: 'Universal' },
  { id: 'breadcrumbs', label: 'Breadcrumb Trail', icon: 'flow', group: 'Universal' },
  { id: 'responsive', label: 'Responsive & Layout', icon: 'table', group: 'Foundation' },
  { id: 'motion', label: 'Motion Tokens', icon: 'flow', group: 'Foundation' },
  { id: 'typespec', label: 'Typography Specimens', icon: 'text', group: 'Foundation' },
  { id: 'iconset', label: 'Icon Set Reference', icon: 'tag', group: 'Foundation' },
  { id: 'illustrations', label: 'Illustration Tokens', icon: 'palette', group: 'Foundation' },
  { id: 'appbar', label: 'Sticky Header / App Bar', icon: 'tabs', group: 'Layout' },
  { id: 'footer', label: 'Footers', icon: 'card', group: 'Layout' },
  { id: 'shell', label: 'App Shell Layout', icon: 'sheet', group: 'Layout' },
  { id: 'carousel', label: 'Carousel & Slider', icon: 'card', group: 'Data Display' },
  { id: 'accordion', label: 'Accordion / FAQ', icon: 'tabs', group: 'Data Display' },
  { id: 'timeline2', label: 'Horizontal Timeline', icon: 'flow', group: 'Data Display' },
  { id: 'infinitescroll', label: 'Infinite & Virtualized List', icon: 'table', group: 'Data Display' },
  { id: 'bottomsheet', label: 'Bottom Sheet (mobile)', icon: 'sheet', group: 'Surfaces' },
  { id: 'lightbox', label: 'Lightbox', icon: 'card', group: 'Surfaces' },
  { id: 'confirmdialog', label: 'Confirmation Dialogs', icon: 'modal', group: 'Surfaces' },
  { id: 'copypaste', label: 'Click to Copy', icon: 'pointer', group: 'Interaction' },
  { id: 'hovercard', label: 'Hover Cards & Popovers', icon: 'tooltip', group: 'Interaction' },
];

function NavIcon({ type }) {
  const s = { width: 15, height: 15, display: 'inline-block', verticalAlign: 'middle' };
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (type) {
    case 'search': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'flow': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l7 7M17 3h3v3M21 17l-7 7m3 0h4v-3"/></svg>;
    case 'upload': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
    case 'sheet': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'chart': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 6-6"/></svg>;
    case 'edit': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
    case 'palette': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>;
    case 'pointer': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="4" y="8" width="16" height="8" rx="4"/></svg>;
    case 'text': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>;
    case 'toggle': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="1" y="7" width="22" height="10" rx="5"/><circle cx="16" cy="12" r="3"/></svg>;
    case 'calendar': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'tag': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
    case 'card': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case 'modal': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'tooltip': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'table': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'tabs': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M8 6V10"/><path d="M14 6V10"/></svg>;
    case 'drag': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>;
    case 'bell': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'avatar': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>;
    default: return null;
  }
}

function DSSubsection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 4, height: 14, background: 'var(--amber)', borderRadius: 2 }}></span>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function StateRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

/* Theme switch — prominent header control */
function ThemeSwitch({ dark, onChange }) {
  return (
    <div role="radiogroup" aria-label="Theme" style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: 'var(--cream-2)', border: '1px solid var(--rule)' }}>
      {[
        { id: 'light', label: 'Light', icon: 'sun' },
        { id: 'dark', label: 'Dark', icon: 'moon' },
      ].map(o => {
        const active = (o.id === 'dark') === dark;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            aria-label={`${o.label} theme`}
            onClick={() => onChange(o.id === 'dark')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, border: 'none',
              background: active ? 'var(--cream)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 700 : 500, fontSize: 12,
              fontFamily: 'var(--font)', cursor: 'pointer',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              transition: 'all .15s',
            }}
          >
            {o.icon === 'sun' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function DSApp() {
  const [section, setSection] = React.useState('cover');
  const [dark, setDark] = React.useState(() => {
    try {
      const saved = localStorage.getItem('jobdash-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    } catch { return false; }
  });
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('jobdash-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  React.useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [section]);

  const renderSection = () => {
    switch (section) {
      case 'cover': return <CoverSection />;
      case 'screens': return <SampleScreensSection />;
      case 'emails': return <EmailTemplatesSection />;
      case 'mobile': return <MobileViewsSection />;
      case 'status': return <StatusPagesSection />;
      case 'tokenexport': return <TokenExportSection />;
      case 'a11y': return <AccessibilitySection />;
      case 'tokens': return <TokensSection />;
      case 'buttons': return <ButtonsSection />;
      case 'inputs': return <InputsSection />;
      case 'controls': return <ControlsSection />;
      case 'datepicker': return <DatePickerSection />;
      case 'chips': return <ChipsSection />;
      case 'cards': return <CardsSection />;
      case 'modals': return <ModalsSection />;
      case 'tooltips': return <TooltipsSection />;
      case 'tables': return <TablesSection />;
      case 'tabs': return <TabsSection />;
      case 'dragdrop': return <DragDropSection />;
      case 'feedback': return <FeedbackSection />;
      case 'avatars': return <AvatarsSection />;
      case 'advanced': return <AdvancedSection />;
      case 'patterns': return <PatternsSection />;
      case 'fileupload': return <FileUploadSection />;
      case 'interactions': return <InteractionsSection />;
      case 'dataviz': return <DataVizSection />;
      case 'editable': return <EditableSection />;
      case 'sidenav': return <SidebarNavSection />;
      case 'wizard': return <WizardSection />;
      case 'emptystates': return <EmptyStatesSection />;
      case 'notifications': return <NotificationCenterSection />;
      case 'searchauto': return <SearchAutocompleteSection />;
      case 'datagrid': return <DataGridSection />;
      case 'calendarview': return <CalendarViewSection />;
      case 'richtexteditor': return <RichTextEditorSection />;
      case 'colorpicker': return <ColorPickerSection />;
      case 'segmented': return <SegmentedControlSection />;
      case 'universal': return <UniversalSection />;
      case 'coachmarks': return <CoachMarksSection />;
      case 'mediacards': return <MediaCardsSection />;
      case 'formvalidation': return <FormValidationSection />;
      case 'breadcrumbs': return <BreadcrumbsSection />;
      case 'responsive': return <ResponsiveSection />;
      case 'motion': return <MotionSection />;
      case 'typespec': return <TypeSpecSection />;
      case 'iconset': return <IconSetSection />;
      case 'illustrations': return <IllustrationsSection />;
      case 'appbar': return <AppBarSection />;
      case 'footer': return <FooterSection />;
      case 'shell': return <ShellSection />;
      case 'carousel': return <CarouselSection />;
      case 'accordion': return <AccordionSection />;
      case 'timeline2': return <HorizontalTimelineSection />;
      case 'infinitescroll': return <InfiniteScrollSection />;
      case 'bottomsheet': return <BottomSheetSection />;
      case 'lightbox': return <LightboxSection />;
      case 'confirmdialog': return <ConfirmDialogSection />;
      case 'copypaste': return <CopyPasteSection />;
      case 'hovercard': return <HoverCardSection />;
      default: return null;
    }
  };

  return (
    <div className="ds-chrome">
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <svg viewBox="0 0 210 100" width="28" height="14">
            <g stroke="var(--amber)" strokeLinecap="round" fill="none" strokeWidth="5">
              <line x1="16" y1="42" x2="60" y2="42" opacity=".5"/>
              <line x1="14" y1="54" x2="72" y2="54" opacity=".85"/>
              <line x1="20" y1="66" x2="60" y2="66" opacity=".5"/>
            </g>
            <g transform="translate(100 20) skewX(-14)">
              <rect x="0" y="0" width="40" height="12" rx="2" fill="var(--ink)"/>
              <rect x="14" y="0" width="12" height="48" rx="2" fill="var(--ink)"/>
              <path d="M 20 48 Q 20 64 6 64 Q -4 64 -5 54" fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>Design System</span>
        </div>

        <div className="ds-sidebar-section">
          {[...new Set(SECTIONS.map(s => s.group))].map(g => (
            <React.Fragment key={g}>
              <div className="ds-sidebar-label">{g}</div>
              {SECTIONS.filter(s => s.group === g).map(s => (
                <div key={s.id} className={`ds-sidebar-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
                  <NavIcon type={s.icon} />
                  {s.label}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>System status</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-vivid)' }}/>
            <span>{SECTIONS.length} sections · AAA</span>
          </div>
        </div>
      </aside>

      <main className="ds-main" ref={contentRef}>
        <div className="ds-main-hd" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.025em' }}>
              {SECTIONS.find(s => s.id === section)?.label}
            </h1>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>
              JobDash UI Kit · v1.0 · WCAG 2.2 AAA
            </p>
          </div>
          <ThemeSwitch dark={dark} onChange={setDark} />
        </div>
        <div className="ds-main-body">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { DSApp, DSSubsection, StateRow, NavIcon });
