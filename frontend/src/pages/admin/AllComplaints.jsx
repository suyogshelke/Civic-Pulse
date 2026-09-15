import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import { formatTicket, formatDate, truncate } from '../../utils/formatters';
import { PRIORITY_META } from '../../utils/constants';

export default function AllComplaints() {
  useDocumentTitle('All complaints');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, loading } = useApi(() => api.complaints.list({}), []);

  const rows = useMemo(() => {
    let r = data || [];
    if (filters.status) r = r.filter((c) => c.status === filters.status);
    if (filters.priority) r = r.filter((c) => c.priority === filters.priority);
    if (filters.category) r = r.filter((c) => c.category === filters.category);
    if (filters.ward) r = r.filter((c) => c.wardName === filters.ward);
    return r;
  }, [data, filters]);

  const columns = [
    { key: 'id', label: 'Ref', sortable: true, value: (r) => r.id, render: (r) => <span className="fw-semibold text-primary">{formatTicket(r.id, r.createdAt)}</span> },
    { key: 'title', label: 'Complaint', sortable: true, render: (r) => (
      <div><div className="fw-semibold">{truncate(r.title, 44)}</div><small className="text-muted">{r.categoryLabel}</small></div>
    ) },
    { key: 'departmentName', label: 'Department', sortable: true },
    { key: 'assignedOfficerName', label: 'Officer', sortable: true, render: (r) => r.assignedOfficerName || <span className="text-muted small">Unassigned</span> },
    { key: 'priority', label: 'Priority', sortable: true, value: (r) => PRIORITY_META[r.priority].weight, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Filed', sortable: true, value: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDate(r.createdAt) },
    { key: 'action', label: '', render: () => <i className="bi bi-chevron-right text-muted" /> },
  ];

  return (
    <>
      <PageHeader eyebrow="Operations" title="All complaints" subtitle="Monitor, assign and manage every complaint in the system." />
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        pageSize={25}
        searchPlaceholder="Search all complaints…"
        onRowClick={(r) => navigate(`/admin/complaints/${r.id}`)}
        toolbar={<ComplaintFilters value={filters} onChange={setFilters} show={['status', 'priority', 'category', 'ward']} />}
        emptyTitle="No complaints match"
        emptyMessage="Adjust the filters to see more."
      />
    </>
  );
}
