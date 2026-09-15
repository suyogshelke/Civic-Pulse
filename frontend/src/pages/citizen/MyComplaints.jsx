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
import { CATEGORIES } from '../../utils/constants';
import { Link } from 'react-router-dom';

export default function MyComplaints() {
  useDocumentTitle('My complaints');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, loading } = useApi(() => api.complaints.list({ citizenId: user.id }), [user.id]);

  const rows = useMemo(() => {
    let r = data || [];
    if (filters.status) r = r.filter((c) => c.status === filters.status);
    if (filters.priority) r = r.filter((c) => c.priority === filters.priority);
    if (filters.category) r = r.filter((c) => c.category === filters.category);
    return r;
  }, [data, filters]);

  const columns = [
    { key: 'id', label: 'Reference', sortable: true, value: (r) => r.id, render: (r) => <span className="fw-semibold text-primary">{formatTicket(r.id, r.createdAt)}</span> },
    { key: 'title', label: 'Complaint', sortable: true, render: (r) => (
      <div>
        <div className="fw-semibold">{truncate(r.title, 52)}</div>
        <small className="text-muted"><i className={`bi ${CATEGORIES[r.category]?.icon} me-1`} />{r.categoryLabel}</small>
      </div>
    ) },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'priority', label: 'Priority', sortable: true, value: (r) => r.priority, render: (r) => <PriorityBadge priority={r.priority} subtle /> },
    { key: 'createdAt', label: 'Filed on', sortable: true, value: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDate(r.createdAt) },
    { key: 'action', label: '', render: (_r) => <i className="bi bi-chevron-right text-muted" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Complaints"
        title="My complaints"
        subtitle="Every issue you have reported, with its current status."
        actions={<Link to="/citizen/submit" className="btn btn-primary"><i className="bi bi-plus-circle me-2" />Report an issue</Link>}
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        searchPlaceholder="Search your complaints…"
        onRowClick={(r) => navigate(`/citizen/complaints/${r.id}`)}
        toolbar={<ComplaintFilters value={filters} onChange={setFilters} show={['status', 'priority', 'category']} />}
        emptyTitle="No complaints match"
        emptyMessage="Try adjusting your filters, or report a new issue."
      />
    </>
  );
}
