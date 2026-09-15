import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_HOME, APP_NAME, CATEGORIES, CATEGORY_KEYS } from '../../utils/constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';

/** The public landing page — the product's thesis, built around the pulse motif. */
export default function Landing() {
  useDocumentTitle('Home');
  const { isAuthenticated, user } = useAuth();
  const homeHref = isAuthenticated ? ROLE_HOME[user.role] : '/register';

  const steps = [
    { icon: 'bi-pencil-square', title: 'Report', text: 'Describe the civic issue, tag its location and attach a photo in under a minute.' },
    { icon: 'bi-signpost-split', title: 'Route', text: 'The complaint is automatically routed to the right municipal department.' },
    { icon: 'bi-gear-wide-connected', title: 'Resolve', text: 'An assigned officer inspects, acts and records resolution evidence.' },
    { icon: 'bi-check2-circle', title: 'Rate', text: 'You track every status change and rate the resolution once it is closed.' },
  ];

  const highlights = [
    { icon: 'bi-people', title: 'Three connected portals', text: 'Purpose-built experiences for citizens, officers and administrators — each sees exactly what it needs.' },
    { icon: 'bi-diagram-3', title: 'Full lifecycle tracking', text: 'Every complaint moves through six transparent stages, from submitted to closed, with a complete audit trail.' },
    { icon: 'bi-graph-up-arrow', title: 'Live analytics', text: 'Dashboards surface pending load, resolution rates and department performance in real time.' },
    { icon: 'bi-shield-lock', title: 'Role-based access', text: 'JWT-secured sign-in ensures citizens, officers and admins only reach the features meant for them.' },
  ];

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="position-relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f2540 0%, #123a63 60%, #1552a3 100%)' }}>
        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center gy-4 py-lg-4">
            <div className="col-lg-6 text-white">
              <span className="cp-eyebrow" style={{ color: '#4dd0e1' }}>Smart E-Governance · {CATEGORIES ? 'Pune' : ''} Municipal</span>
              <h1 className="display-4 fw-bold mt-2 mb-3 text-white" style={{ lineHeight: 1.1 }}>
                Every civic issue,<br />on one clear pulse.
              </h1>
              <p className="fs-5 mb-4" style={{ color: '#c5d6ea', maxWidth: 520 }}>
                {APP_NAME} connects citizens with government departments to report, track and
                resolve civic problems — potholes, garbage, water, drainage, electricity and more —
                through a single transparent platform.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to={homeHref} className="btn btn-pulse btn-lg px-4">
                  <i className="bi bi-megaphone me-2" />{isAuthenticated ? 'Go to my dashboard' : 'Report an issue'}
                </Link>
                <Link to="/track" className="btn btn-lg btn-outline-light px-4">
                  <i className="bi bi-search me-2" />Track a complaint
                </Link>
              </div>
              <div className="d-flex gap-4 mt-4 pt-2">
                <div><div className="h3 fw-bold text-white mb-0">6-stage</div><small style={{ color: '#9db4cf' }}>lifecycle tracking</small></div>
                <div><div className="h3 fw-bold text-white mb-0">12</div><small style={{ color: '#9db4cf' }}>issue categories</small></div>
                <div><div className="h3 fw-bold text-white mb-0">3</div><small style={{ color: '#9db4cf' }}>connected portals</small></div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-elevated p-4" style={{ background: 'rgba(255,255,255,0.97)' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="cp-eyebrow">Live civic pulse</span>
                  <span className="badge text-bg-success"><i className="bi bi-broadcast me-1" />Monitoring</span>
                </div>
                {/* Signature ECG pulse line */}
                <svg className="pulse-line" viewBox="0 0 500 120" preserveAspectRatio="none" style={{ height: 120 }}>
                  <path d="M0 60 L60 60 L80 60 L95 30 L115 95 L135 20 L155 60 L210 60 L230 60 L245 40 L262 80 L280 60 L340 60 L360 60 L375 25 L395 90 L412 60 L500 60" />
                </svg>
                <div className="row g-2 mt-2">
                  {['POTHOLE', 'GARBAGE', 'WATER_LEAKAGE', 'STREETLIGHT'].map((c) => (
                    <div className="col-6" key={c}>
                      <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--cp-surface)' }}>
                        <i className={`bi ${CATEGORIES[c].icon} text-primary`} />
                        <small className="fw-semibold text-truncate">{CATEGORIES[c].label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- how it works */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <span className="cp-eyebrow">How it works</span>
          <h2 className="fw-bold mt-2">From report to resolution</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: 560 }}>
            A single, accountable workflow that keeps citizens informed at every step.
          </p>
        </div>
        <div className="row g-4">
          {steps.map((s, i) => (
            <div className="col-md-6 col-lg-3" key={s.title}>
              <div className="card h-100 p-4 hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="stat-icon" style={{ background: 'rgba(21,82,163,0.1)', color: '#1552a3' }}>
                    <i className={`bi ${s.icon}`} />
                  </span>
                  <span className="display-6 fw-bold" style={{ color: 'var(--cp-border)', fontFamily: 'Space Grotesk' }}>0{i + 1}</span>
                </div>
                <h5 className="fw-bold">{s.title}</h5>
                <p className="text-muted mb-0 small">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- highlights */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cp-border)', borderBottom: '1px solid var(--cp-border)' }}>
        <div className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-4">
              <span className="cp-eyebrow">Why {APP_NAME}</span>
              <h2 className="fw-bold mt-2 mb-3">Built for transparency and accountability</h2>
              <p className="text-muted">
                Traditional civic complaints rely on phone calls, physical visits and scattered
                records. {APP_NAME} replaces that with one digital system where nothing falls
                through the cracks.
              </p>
              <Link to="/register" className="btn btn-primary mt-2"><i className="bi bi-person-plus me-2" />Create a citizen account</Link>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                {highlights.map((h) => (
                  <div className="col-md-6" key={h.title}>
                    <div className="d-flex gap-3 p-3 rounded-3 h-100" style={{ background: 'var(--cp-surface)' }}>
                      <i className={`bi ${h.icon} fs-4 text-primary`} />
                      <div>
                        <h6 className="fw-bold mb-1">{h.title}</h6>
                        <p className="text-muted small mb-0">{h.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- categories */}
      <section className="container py-5">
        <div className="text-center mb-4">
          <span className="cp-eyebrow">What you can report</span>
          <h2 className="fw-bold mt-2">Twelve civic issue categories</h2>
        </div>
        <div className="row g-3">
          {CATEGORY_KEYS.map((key) => (
            <div className="col-6 col-md-4 col-lg-3" key={key}>
              <div className="card h-100 p-3 text-center hover-lift">
                <i className={`bi ${CATEGORIES[key].icon} fs-3 text-primary mb-2`} />
                <div className="small fw-semibold">{CATEGORIES[key].label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- CTA */}
      <section className="container pb-5">
        <div className="card card-elevated text-center p-5" style={{ background: 'linear-gradient(135deg, #123a63, #1552a3)' }}>
          <h2 className="fw-bold text-white mb-2">Ready to make your city work better?</h2>
          <p className="mb-4" style={{ color: '#c5d6ea' }}>Join thousands of citizens keeping their neighbourhoods accountable.</p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Link to="/register" className="btn btn-pulse btn-lg px-4">Get started free</Link>
            <Link to="/login" className="btn btn-lg btn-outline-light px-4">Sign in</Link>
          </div>
        </div>
      </section>
    </>
  );
}
