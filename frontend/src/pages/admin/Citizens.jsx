import { useState } from 'react';
import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { initials, formatDate } from '../../utils/formatters';

export default function Citizens() {
  useDocumentTitle('Citizens');
  const toast = useToast();
  const { data, loading, refetch } = useApi(() => api.users.list('CITIZEN'), []);

  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await api.users.toggleActive(target.id);
      toast.success(`${target.fullName} ${target.active ? 'deactivated' : 'reactivated'}.`);
      setTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the account.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'fullName', label: 'Citizen', sortable: true, render: (r) => (
      <div className="d-flex align-items-center gap-2">
        <div className="avatar avatar-sm">{initials(r.fullName)}</div>
        <div><div className="fw-semibold">{r.fullName}</div><small className="text-muted">{r.email}</small></div>
      </div>
    ) },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || <span className="text-muted">—</span> },
    { key: 'ward', label: 'Ward', sortable: true, render: (r) => r.ward || <span className="text-muted">—</span> },
    { key: 'complaintCount', label: 'Complaints', sortable: true, className: 'text-center', render: (r) => <span className="badge badge-soft">{r.complaintCount ?? 0}</span> },
    { key: 'createdAt', label: 'Member since', sortable: true, value: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDate(r.createdAt) },
    { key: 'active', label: 'Status', sortable: true, render: (r) => (
      <span className={`badge ${r.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>{r.active ? 'Active' : 'Inactive'}</span>
    ) },
    { key: 'actions', label: '', className: 'text-end', render: (r) => (
      <button className={`btn btn-sm ${r.active ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => setTarget(r)}>
        <i className={`bi ${r.active ? 'bi-person-dash' : 'bi-person-check'} me-1`} />{r.active ? 'Deactivate' : 'Reactivate'}
      </button>
    ) },
  ];

  return (
    <>
      <PageHeader eyebrow="People" title="Citizens" subtitle="Registered residents who report civic issues." />

      <DataTable columns={columns} rows={data || []} loading={loading} searchPlaceholder="Search citizens…" emptyTitle="No citizens registered yet" />

      <ConfirmModal
        open={!!target}
        title={target?.active ? 'Deactivate citizen?' : 'Reactivate citizen?'}
        message={target?.active
          ? `${target?.fullName} will no longer be able to sign in or file complaints.`
          : `${target?.fullName} will regain access to their citizen account.`}
        confirmLabel={target?.active ? 'Deactivate' : 'Reactivate'}
        variant={target?.active ? 'danger' : 'success'}
        busy={busy}
        onConfirm={confirmToggle}
        onCancel={() => !busy && setTarget(null)}
      />
    </>
  );
}
