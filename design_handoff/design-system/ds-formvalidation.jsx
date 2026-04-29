/* ═══ FORM VALIDATION ═══ */

function FormValidationSection() {
  const [form, setForm] = React.useState({ company: '', role: '', email: 'bad-email', salary: '150000', url: 'https://stripe.com/jobs' });
  const [touched, setTouched] = React.useState({ email: true });
  const [submitted, setSubmitted] = React.useState(false);

  const errors = {};
  if (!form.company && (touched.company || submitted)) errors.company = 'Company name is required';
  if (!form.role && (touched.role || submitted)) errors.role = 'Role is required';
  if (form.email && !/\S+@\S+\.\S+/.test(form.email) && (touched.email || submitted)) errors.email = 'Enter a valid email address';

  const success = {};
  if (form.url && /^https?:\/\//.test(form.url)) success.url = true;
  if (form.salary && Number(form.salary) > 0) success.salary = true;

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const blur = (key) => setTouched(t => ({ ...t, [key]: true }));

  const handleSubmit = () => {
    setSubmitted(true);
    setTouched({ company: true, role: true, email: true });
  };

  return (
    <div>
      <DSSubsection title="Inline Validation">
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
          Real-time field validation with error and success states. Errors appear on blur or submit. Green check confirms valid input.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Live form */}
          <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Add Application</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Company - required error */}
              <div className="ds-field">
                <label className="ds-label">Company *</label>
                <input className={`ds-input ${errors.company ? 'error' : ''}`} placeholder="e.g. Stripe"
                  value={form.company} onChange={e => update('company', e.target.value)} onBlur={() => blur('company')} />
                {errors.company && <span className="ds-error-text">{errors.company}</span>}
              </div>

              {/* Role - required error */}
              <div className="ds-field">
                <label className="ds-label">Role *</label>
                <input className={`ds-input ${errors.role ? 'error' : ''}`} placeholder="e.g. Staff Engineer"
                  value={form.role} onChange={e => update('role', e.target.value)} onBlur={() => blur('role')} />
                {errors.role && <span className="ds-error-text">{errors.role}</span>}
              </div>

              {/* Email - format error */}
              <div className="ds-field">
                <label className="ds-label">Recruiter Email</label>
                <div style={{ position: 'relative' }}>
                  <input className={`ds-input ${errors.email ? 'error' : ''}`} placeholder="recruiter@company.com"
                    value={form.email} onChange={e => update('email', e.target.value)} onBlur={() => blur('email')} />
                  {errors.email && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </span>
                  )}
                </div>
                {errors.email && <span className="ds-error-text">{errors.email}</span>}
              </div>

              {/* Salary - success */}
              <div className="ds-field">
                <label className="ds-label">Salary</label>
                <div style={{ position: 'relative' }}>
                  <input className="ds-input" style={{ borderColor: success.salary ? 'var(--green)' : undefined, boxShadow: success.salary ? '0 0 0 3px rgba(34,197,94,.1)' : undefined, fontFamily: 'var(--mono)' }}
                    value={form.salary} onChange={e => update('salary', e.target.value)} placeholder="150000" />
                  {success.salary && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  )}
                </div>
              </div>

              {/* URL - success */}
              <div className="ds-field">
                <label className="ds-label">Job URL</label>
                <div style={{ position: 'relative' }}>
                  <input className="ds-input" style={{ borderColor: success.url ? 'var(--green)' : undefined, boxShadow: success.url ? '0 0 0 3px rgba(34,197,94,.1)' : undefined }}
                    value={form.url} onChange={e => update('url', e.target.value)} placeholder="https://..." />
                  {success.url && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="ds-btn amber" onClick={handleSubmit}>Submit</button>
                <button className="ds-btn ghost" onClick={() => { setForm({ company: '', role: '', email: '', salary: '', url: '' }); setTouched({}); setSubmitted(false); }}>Reset</button>
              </div>
            </div>
          </div>

          {/* State reference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Field states</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="ds-field">
                  <label className="ds-label">Default</label>
                  <input className="ds-input" placeholder="Placeholder text" readOnly />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Focused</label>
                  <input className="ds-input" readOnly style={{ borderColor: 'var(--amber)', boxShadow: '0 0 0 3px rgba(245,158,11,.12)' }} defaultValue="Typing…" />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Error</label>
                  <input className="ds-input error" readOnly defaultValue="bad-email" />
                  <span className="ds-error-text">Enter a valid email address</span>
                </div>
                <div className="ds-field">
                  <label className="ds-label">Success</label>
                  <input className="ds-input" readOnly defaultValue="valid@email.com" style={{ borderColor: 'var(--green)', boxShadow: '0 0 0 3px rgba(34,197,94,.1)' }} />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Disabled</label>
                  <input className="ds-input" disabled placeholder="Cannot edit" />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Field group with helper text</div>
              <div className="glass" style={{ borderRadius: 14, padding: 16 }}>
                <div className="ds-field">
                  <label className="ds-label">Password</label>
                  <input className="ds-input" type="password" defaultValue="mypassword123" readOnly />
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Must be at least 8 characters with one number</div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? 'var(--green-vivid)' : 'var(--cream-2)', transition: 'background .2s' }}></div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Strong password</div>
              </div>
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { FormValidationSection });
