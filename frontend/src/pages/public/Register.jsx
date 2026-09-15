import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateRegistration, hasErrors, passwordStrength } from '../../utils/validators';
import { WARDS, ROLE_HOME, APP_NAME } from '../../utils/constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import BrandMark from '../../components/layout/BrandMark';

const STRENGTH = [
  { label: '', color: '' },
  { label: 'Weak', color: 'danger' },
  { label: 'Fair', color: 'warning' },
  { label: 'Good', color: 'info' },
  { label: 'Strong', color: 'success' },
];

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', ward: '', address: '', pincode: '',
    password: '', confirmPassword: '', acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const strength = passwordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    if (hasErrors(found)) {
      document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      const user = await register(form);
      toast.success('Account created — welcome to ' + APP_NAME + '!');
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      if (/email/i.test(err.message)) setErrors({ email: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="text-center mb-4">
            <div className="cp-brand justify-content-center mb-2"><BrandMark size={40} />{APP_NAME}</div>
            <h3 className="fw-bold mb-1">Create your citizen account</h3>
            <p className="text-muted">Report civic issues and track them to resolution.</p>
          </div>

          <div className="card card-elevated p-4 p-md-5">
            <form onSubmit={submit} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full name <span className="text-danger">*</span></label>
                  <input className={`form-control ${errors.fullName ? 'is-invalid' : ''}`} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="e.g. Suyog Shelke" />
                  <div className="invalid-feedback">{errors.fullName}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email address <span className="text-danger">*</span></label>
                  <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile number <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={form.phone} maxLength={10} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit number" />
                    <div className="invalid-feedback">{errors.phone}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ward <span className="text-danger">*</span></label>
                  <select className={`form-select ${errors.ward ? 'is-invalid' : ''}`} value={form.ward} onChange={(e) => set({ ward: e.target.value })}>
                    <option value="">Select your ward…</option>
                    {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.ward}</div>
                </div>
                <div className="col-md-8">
                  <label className="form-label">Address <span className="text-danger">*</span></label>
                  <input className={`form-control ${errors.address ? 'is-invalid' : ''}`} value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="House / street / area" />
                  <div className="invalid-feedback">{errors.address}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">PIN code</label>
                  <input className={`form-control ${errors.pincode ? 'is-invalid' : ''}`} value={form.pincode} maxLength={6} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '') })} placeholder="411038" />
                  <div className="invalid-feedback">{errors.pincode}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Password <span className="text-danger">*</span></label>
                  <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="At least 8 characters" autoComplete="new-password" />
                  <div className="invalid-feedback">{errors.password}</div>
                  {form.password && !errors.password && (
                    <div className="mt-1">
                      <div className="progress" style={{ height: 5 }}>
                        <div className={`progress-bar bg-${STRENGTH[strength].color}`} style={{ width: `${(strength / 4) * 100}%` }} />
                      </div>
                      <small className={`text-${STRENGTH[strength].color}`}>{STRENGTH[strength].label} password</small>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm password <span className="text-danger">*</span></label>
                  <input type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} value={form.confirmPassword} onChange={(e) => set({ confirmPassword: e.target.value })} placeholder="Re-enter your password" autoComplete="new-password" />
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`} type="checkbox" id="terms" checked={form.acceptTerms} onChange={(e) => set({ acceptTerms: e.target.checked })} />
                    <label className="form-check-label small" htmlFor="terms">
                      I agree to use this civic platform responsibly and confirm the information I provide is accurate.
                    </label>
                    <div className="invalid-feedback">{errors.acceptTerms}</div>
                  </div>
                </div>

                <div className="col-12 d-grid">
                  <button type="submit" className="btn btn-primary py-2" disabled={busy}>
                    {busy ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</> : <><i className="bi bi-person-plus me-2" />Create account</>}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <p className="text-center text-muted mt-3">
            Already have an account? <Link to="/login" className="fw-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
