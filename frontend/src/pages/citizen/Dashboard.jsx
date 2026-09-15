import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatTicket, timeAgo, truncate } from '../../utils/formatters';

export default function CitizenDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useApi(() => api.analytics.citizen(), []);
  const { data: complaints, loading: listLoading } = useApi(() => api.complaints.list({ citizenId: user.id }), [user.id]);

  const recent = (complaints || []).slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow={`Welcome, ${user.fullName.split(' ')[0]}`}
        title="Your civic dashboard"
        subtitle="Report new issues and follow the ones you have already raised."
        actions={<Link to="/citizen/submit" className="btn btn-primary"><i className="bi bi-plus-circle me-2" />Report an issue</Link>}
      />

      {statsLoading ? <Loader /> : (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3"><StatCard label="Total complaints" value={stats.total} icon="bi-card-list" variant="primary" /></div>
          <div className="col-6 col-lg-3"><StatCard label="Open / in progress" value={stats.open} icon="bi-hourglass-split" variant="warning" /></div>
          <div className="col-6 col-lg-3"><StatCard label="Resolved" value={stats.resolved} icon="bi-check2-circle" variant="success" /></div>
          <div className="col-6 col-lg-3"><StatCard label="Awaiting your rating" value={stats.awaitingFeedback} icon="bi-star" variant="info" /></div>
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Recent complaints</span>
          <Link to="/citizen/complaints" className="btn btn-sm btn-light">View all <i className="bi bi-arrow-right-short" /></Link>
        </div>
        <div className="card-body p-0">
          {listLoading ? <Loader /> : recent.length === 0 ? (
            <EmptyState
              icon="bi-clipboard-plus"
              title="No complaints yet"
              message="When you report a civic issue, it will appear here so you can track its progress."
              action={<Link to="/citizen/submit" className="btn btn-primary btn-sm"><i className="bi bi-plus-circle me-1" />Report your first issue</Link>}
            />
          ) : (
            <div className="list-group list-group-flush">
              {recent.map((c) => (
                <Link key={c.id} to={`/citizen/complaints/${c.id}`} className="list-group-item list-group-item-action py-3">
                  <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                    <div>
                      <div className="cp-eyebrow" style={{ fontSize: '0.66rem' }}>{formatTicket(c.id, c.createdAt)}</div>
                      <div className="fw-semibold">{c.title}</div>
                      <div className="text-muted small">{truncate(c.description, 90)}</div>
                    </div>
                    <div className="text-end d-flex flex-column gap-1 align-items-end">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} subtle />
                      <small className="text-muted">{timeAgo(c.createdAt)}</small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
