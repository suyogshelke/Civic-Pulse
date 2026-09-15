import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateLogin, hasErrors } from '../../utils/validators';
import { ROLE_HOME, APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { USE_MOCK } from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import BrandMark from '../../components/layout/BrandMark';

const DEMO = [
  { role: 'Citizen', email: 'suyog@civicpulse.in', password: 'Citizen@123', icon: 'bi-person' },
  { role: 'Officer', email: 'rahul.officer@civicpulse.in', password: 'Officer@123', icon: 'bi-person-badge' },
  { role: 'Administrator', email: 'admin@civicpulse.in', password: 'Admin@123', icon: 'bi-shield-lock' },
];

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateLogin(form);
    setErrors(found);
    if (hasErrors(found)) return;

    setBusy(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      const dest = location.state?.from?.pathname || ROLE_HOME[user.role];
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sign in failed');
      setErrors({ password: ' ' });
    } finally {
      setBusy(false);
    }
  };

  const fill = (demo) => { set({ email: demo.email, password: demo.password }); setErrors({}); };

  return (
    <div className="container py-5">
      <div className="row justify-content-center g-0 shadow-sm" style={{ borderRadius: 'var(--cp-radius)', overflow: 'hidden', maxWidth: 940, margin: '0 auto' }}>
        {/* Left: brand panel */}
        <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-between p-4 text-white" style={{ background: 'linear-gradient(160deg, #0f2540, #1552a3)' }}>
          <div className="cp-brand text-white"><BrandMark />{APP_NAME}</div>
          <div>
            <svg className="pulse-line mb-3" viewBox="0 0 300 60" preserveAspectRatio="none" style={{ height: 60 }}>
              <path d="M0 30 L120 30 L135 8 L152 52 L168 30 L300 30" />
            </svg>
            <h4 className="fw-bold text-white">Welcome back.</h4>
            <p style={{ color: '#c5d6ea' }} className="small mb-0">{APP_TAGLINE}. Sign in to report, manage or monitor civic issues.</p>
          </div>
          <div className="small" style={{ color: '#9db4cf' }}>Secured with role-based access</div>
        </div>

        {/* Right: form */}
        <div className="col-lg-7 bg-white p-4 p-md-5">
          <h3 className="fw-bold mb-1">Sign in</h3>
          <p className="text-muted mb-4">Enter your credentials to continue.</p>

          <form onSubmit={submit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className={`form-control ps-5 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  autoComplete="email"
                />
                <div className="invalid-feedback">{errors.email}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-control ps-5 pe-5 ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" className="btn position-absolute end-0 top-0 text-muted" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
                <div className="invalid-feedback">{errors.password}</div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-muted mt-3 mb-0">
            New here? <Link to="/register" className="fw-semibold">Create a citizen account</Link>
          </p>

          {USE_MOCK && (
            <div className="mt-4 pt-3 border-top">
              <div className="cp-eyebrow mb-2">Demo accounts — click to fill</div>
              <div className="d-grid gap-2">
                {DEMO.map((d) => (
                  <button key={d.role} type="button" className="btn btn-light btn-sm d-flex align-items-center gap-2 text-start" onClick={() => fill(d)}>
                    <i className={`bi ${d.icon} text-primary`} />
                    <span className="fw-semibold" style={{ width: 96 }}>{d.role}</span>
                    <span className="text-muted small text-truncate">{d.email}</span>
                    <i className="bi bi-arrow-right-short ms-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
