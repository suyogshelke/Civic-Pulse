import { useState } from 'react';
import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { initials } from '../../utils/formatters';
import { validateOfficer, hasErrors } from '../../utils/validators';

const BLANK = { fullName: '', email: '', phone: '', departmentId: '', designation: '', password: '' };

export default function Officers() {
  useDocumentTitle('Officers');
  const toast = useToast();
  const { data: officers, loading, refetch } = useApi(() => api.users.list('OFFICER'), []);
  const { data: departments } = useApi(() => api.departments.list(), []);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const openNew = () => { setEditing({}); setForm(BLANK); setErrors({}); };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ id: o.id, fullName: o.fullName, email: o.email, phone: o.phone || '', departmentId: String(o.departmentId || ''), designation: o.designation || '', password: '' });
    setErrors({});
  };
  const close = () => { if (!busy) setEditing(null); };
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    const errs = validateOfficer(form, { requirePassword: !form.id });
    setErrors(errs);
    if (hasErrors(errs)) return;
    setBusy(true);
    try {
      await api.users.saveOfficer(form);
      toast.success(form.id ? 'Officer updated.' : 'Officer account created.');
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save the officer.');
    } finally {
      setBusy(false);
    }
  };

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await api.users.toggleActive(toggleTarget.id);
      toast.success(`${toggleTarget.fullName} ${toggleTarget.active ? 'deactivated' : 'reactivated'}.`);
      setToggleTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the account.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'fullName', label: 'Officer', sortable: true, render: (r) => (
      <div className="d-flex align-items-center gap-2">
        <div className="avatar avatar-sm">{initials(r.fullName)}</div>
        <div><div className="fw-semibold">{r.fullName}</div><small className="text-muted">{r.email}</small></div>
      </div>
    ) },
    { key: 'departmentName', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true, render: (r) => r.designation || <span className="text-muted">—</span> },
    { key: 'assignedCount', label: 'Assigned', sortable: true, className: 'text-center', render: (r) => <span className="badge badge-soft">{r.assignedCount ?? 0}</span> },
    { key: 'active', label: 'Status', sortable: true, render: (r) => (
      <span className={`badge ${r.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>{r.active ? 'Active' : 'Inactive'}</span>
    ) },
    { key: 'actions', label: '', className: 'text-end', render: (r) => (
      <div className="d-flex gap-1 justify-content-end">
        <button className="btn btn-sm btn-light" onClick={() => openEdit(r)}><i className="bi bi-pencil" /></button>
        <button className={`btn btn-sm ${r.active ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => setToggleTarget(r)}>
          <i className={`bi ${r.active ? 'bi-person-dash' : 'bi-person-check'}`} />
        </button>
      </div>
    ) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Officers"
        subtitle="Field officers who inspect and resolve complaints."
        actions={<button className="btn btn-pulse" onClick={openNew}><i className="bi bi-person-plus me-2" />Add officer</button>}
      />

      <DataTable columns={columns} rows={officers || []} loading={loading} searchPlaceholder="Search officers…" emptyTitle="No officers yet" />

      <Modal
        open={editing !== null}
        title={form.id ? 'Edit officer' : 'Add officer'}
        onClose={close}
        footer={
          <>
            <button className="btn btn-light" onClick={close} disabled={busy}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}Save officer
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label">Full name</label>
            <input className={`form-control ${errors.fullName ? 'is-invalid' : ''}`} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
            <div className="invalid-feedback">{errors.fullName}</div>
          </div>
          <div className="col-md-5">
            <label className="form-label">Phone</label>
            <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} maxLength={10} value={form.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })} />
            <div className="invalid-feedback">{errors.phone}</div>
          </div>
          <div className="col-12">
            <label className="form-label">Email</label>
            <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={(e) => set({ email: e.target.value })} disabled={!!form.id} />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <select className={`form-select ${errors.departmentId ? 'is-invalid' : ''}`} value={form.departmentId} onChange={(e) => set({ departmentId: e.target.value })}>
              <option value="">Select department…</option>
              {(departments || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="invalid-feedback">{errors.departmentId}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Designation</label>
            <input className={`form-control ${errors.designation ? 'is-invalid' : ''}`} value={form.designation} onChange={(e) => set({ designation: e.target.value })} placeholder="e.g. Junior Engineer" />
            <div className="invalid-feedback">{errors.designation}</div>
          </div>
          <div className="col-12">
            <label className="form-label">{form.id ? 'Reset password' : 'Temporary password'} {form.id && <span className="text-muted fw-normal">(leave blank to keep current)</span>}</label>
            <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} value={form.password} onChange={(e) => set({ password: e.target.value })} autoComplete="new-password" />
            <div className="invalid-feedback">{errors.password}</div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.active ? 'Deactivate officer?' : 'Reactivate officer?'}
        message={toggleTarget?.active
          ? `${toggleTarget?.fullName} will no longer be able to sign in or receive new assignments.`
          : `${toggleTarget?.fullName} will regain access to the officer portal.`}
        confirmLabel={toggleTarget?.active ? 'Deactivate' : 'Reactivate'}
        variant={toggleTarget?.active ? 'danger' : 'success'}
        busy={busy}
        onConfirm={confirmToggle}
        onCancel={() => !busy && setToggleTarget(null)}
      />
    </>
  );
}
