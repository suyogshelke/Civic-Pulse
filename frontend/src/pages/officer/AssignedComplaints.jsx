import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import { formatTicket, formatDate, truncate } from '../../utils/formatters';
import { PRIORITY_META } from '../../utils/constants';

export default function AssignedComplaints() {
  useDocumentTitle('Assigned complaints');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, loading } = useApi(() => api.complaints.list({ officerId: user.id }), [user.id]);

  const rows = useMemo(() => {
    let r = data || [];
    if (filters.status) r = r.filter((c) => c.status === filters.status);
    if (filters.priority) r = r.filter((c) => c.priority === filters.priority);
    if (filters.category) r = r.filter((c) => c.category === filters.category);
    return r;
  }, [data, filters]);

  const columns = [
    { key: 'id', label: 'Ref', sortable: true, value: (r) => r.id, render: (r) => <span className="fw-semibold text-primary">{formatTicket(r.id, r.createdAt)}</span> },
    { key: 'title', label: 'Complaint', sortable: true, render: (r) => (
      <div><div className="fw-semibold">{truncate(r.title, 48)}</div><small className="text-muted">{r.wardName}</small></div>
    ) },
    { key: 'priority', label: 'Priority', sortable: true, value: (r) => PRIORITY_META[r.priority].weight, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'citizenName', label: 'Reported by', sortable: true },
    { key: 'createdAt', label: 'Filed', sortable: true, value: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDate(r.createdAt) },
    { key: 'action', label: '', render: () => <i className="bi bi-chevron-right text-muted" /> },
  ];

  return (
    <>
      <PageHeader eyebrow="Work" title="Assigned complaints" subtitle="Complaints routed to you for inspection and resolution." />
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        searchPlaceholder="Search assigned complaints…"
        onRowClick={(r) => navigate(`/officer/complaints/${r.id}`)}
        toolbar={<ComplaintFilters value={filters} onChange={setFilters} show={['status', 'priority', 'category']} />}
        emptyTitle="No complaints assigned"
        emptyMessage="You have no complaints matching these filters."
      />
    </>
  );
}
