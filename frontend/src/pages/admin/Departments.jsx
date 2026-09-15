import { useState } from 'react';
import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { validateDepartment, hasErrors } from '../../utils/validators';

const BLANK = { name: '', code: '', head: '', email: '', phone: '', active: true };

export default function Departments() {
  useDocumentTitle('Departments');
  const toast = useToast();
  const { data, loading, refetch } = useApi(() => api.departments.list(), []);

  const [editing, setEditing] = useState(null); // null = closed
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const openNew = () => { setEditing({}); setForm(BLANK); setErrors({}); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ id: d.id, name: d.name, code: d.code, head: d.head || '', email: d.email || '', phone: d.phone || '', active: d.active });
    setErrors({});
  };
  const close = () => { if (!busy) setEditing(null); };
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    const errs = validateDepartment(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setBusy(true);
    try {
      await api.departments.save({ ...form, code: form.code.toUpperCase() });
      toast.success(form.id ? 'Department updated.' : 'Department created.');
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save the department.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Code', sortable: true, render: (r) => <span className="badge badge-soft">{r.code}</span> },
    { key: 'name', label: 'Department', sortable: true, render: (r) => <span className="fw-semibold">{r.name}</span> },
    { key: 'head', label: 'Head', sortable: true, render: (r) => r.head || <span className="text-muted">—</span> },
    { key: 'email', label: 'Contact', render: (r) => (
      <div className="small"><div>{r.email}</div><div className="text-muted">{r.phone}</div></div>
    ) },
    { key: 'officerCount', label: 'Officers', sortable: true, className: 'text-center', render: (r) => r.officerCount },
    { key: 'complaintCount', label: 'Complaints', sortable: true, className: 'text-center', render: (r) => r.complaintCount },
    { key: 'active', label: 'Status', sortable: true, render: (r) => (
      <span className={`badge ${r.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>{r.active ? 'Active' : 'Inactive'}</span>
    ) },
    { key: 'actions', label: '', render: (r) => (
      <button className="btn btn-sm btn-light" onClick={() => openEdit(r)}><i className="bi bi-pencil me-1" />Edit</button>
    ) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Departments"
        subtitle="Civic departments that complaints are routed to."
        actions={<button className="btn btn-pulse" onClick={openNew}><i className="bi bi-plus-lg me-2" />New department</button>}
      />

      <DataTable columns={columns} rows={data || []} loading={loading} searchPlaceholder="Search departments…" emptyTitle="No departments yet" />

      <Modal
        open={editing !== null}
        title={form.id ? 'Edit department' : 'New department'}
        onClose={close}
        footer={
          <>
            <button className="btn btn-light" onClick={close} disabled={busy}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}Save department
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-8">
            <label className="form-label">Department name</label>
            <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={(e) => set({ name: e.target.value })} />
            <div className="invalid-feedback">{errors.name}</div>
          </div>
          <div className="col-4">
            <label className="form-label">Code</label>
            <input className={`form-control text-uppercase ${errors.code ? 'is-invalid' : ''}`} maxLength={5} value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} />
            <div className="invalid-feedback">{errors.code}</div>
          </div>
          <div className="col-12">
            <label className="form-label">Department head <span className="text-muted fw-normal">(optional)</span></label>
            <input className="form-control" value={form.head} onChange={(e) => set({ head: e.target.value })} />
          </div>
          <div className="col-md-7">
            <label className="form-label">Email</label>
            <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={(e) => set({ email: e.target.value })} />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <div className="col-md-5">
            <label className="form-label">Phone</label>
            <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} maxLength={10} value={form.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })} />
            <div className="invalid-feedback">{errors.phone}</div>
          </div>
          <div className="col-12">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="deptActive" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
              <label className="form-check-label" htmlFor="deptActive">Active — available for complaint routing</label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
