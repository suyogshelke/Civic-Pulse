import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { WARDS, ROLE_LABELS, ROLES } from '../../utils/constants';
import { initials, formatDate } from '../../utils/formatters';
import { passwordProblem } from '../../utils/validators';
import PageHeader from '../common/PageHeader';

/**
 * Shared profile screen used by all three portals. Citizens can edit their
 * contact details; every role can change their password.
 */
export default function ProfilePanel() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const editable = user.role === ROLES.CITIZEN;

  const [form, setForm] = useState({
    fullName: user.fullName || '', phone: user.phone || '',
    ward: user.ward || '', address: user.address || '', pincode: user.pincode || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErr, setPwErr] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await refreshProfile(form);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword) errs.currentPassword = 'Enter your current password';
    const problem = passwordProblem(pw.newPassword);
    if (problem) errs.newPassword = problem;
    if (pw.newPassword !== pw.confirm) errs.confirm = 'Passwords do not match';
    setPwErr(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      await api.auth.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Could not change password.');
      setPwErr({ currentPassword: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" subtitle="Manage your personal details and password." />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-body p-4 text-center">
            <div className="avatar avatar-lg mx-auto mb-3">{initials(user.fullName)}</div>
            <h5 className="fw-bold mb-0">{user.fullName}</h5>
            <div className="text-muted small">{user.email}</div>
            <span className="badge badge-soft mt-2 mx-auto">{ROLE_LABELS[user.role]}</span>
            <hr />
            <dl className="row small text-start mb-0">
              <dt className="col-5 text-muted fw-normal">Phone</dt><dd className="col-7">{user.phone || '—'}</dd>
              {user.designation && (<><dt className="col-5 text-muted fw-normal">Designation</dt><dd className="col-7">{user.designation}</dd></>)}
              {user.ward && (<><dt className="col-5 text-muted fw-normal">Ward</dt><dd className="col-7">{user.ward}</dd></>)}
              <dt className="col-5 text-muted fw-normal">Member since</dt><dd className="col-7">{formatDate(user.createdAt)}</dd>
            </dl>
          </div>
        </div>

        <div className="col-lg-8">
          {editable && (
            <div className="card card-body p-4 mb-4">
              <h6 className="fw-bold mb-3">Personal details</h6>
              <form onSubmit={saveProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full name</label>
                    <input className="form-control" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mobile number</label>
                    <input className="form-control" value={form.phone} maxLength={10} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ward</label>
                    <select className="form-select" value={form.ward} onChange={(e) => set({ ward: e.target.value })}>
                      <option value="">Select ward…</option>
                      {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">PIN code</label>
                    <input className="form-control" value={form.pincode} maxLength={6} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '') })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={(e) => set({ address: e.target.value })} />
                  </div>
                  <div className="col-12 text-end">
                    <button className="btn btn-primary" disabled={savingProfile}>
                      {savingProfile ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="card card-body p-4">
            <h6 className="fw-bold mb-3">Change password</h6>
            <form onSubmit={changePassword}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Current password</label>
                  <input type="password" className={`form-control ${pwErr.currentPassword ? 'is-invalid' : ''}`} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
                  <div className="invalid-feedback">{pwErr.currentPassword}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">New password</label>
                  <input type="password" className={`form-control ${pwErr.newPassword ? 'is-invalid' : ''}`} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
                  <div className="invalid-feedback">{pwErr.newPassword}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm new password</label>
                  <input type="password" className={`form-control ${pwErr.confirm ? 'is-invalid' : ''}`} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
                  <div className="invalid-feedback">{pwErr.confirm}</div>
                </div>
                <div className="col-12 text-end">
                  <button className="btn btn-outline-primary" disabled={savingPw}>
                    {savingPw ? <><span className="spinner-border spinner-border-sm me-2" />Updating…</> : 'Update password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
