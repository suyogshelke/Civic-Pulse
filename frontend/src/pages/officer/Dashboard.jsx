import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { PRIORITY_META, STATUS, ROLE_LABELS } from '../../utils/constants';
import { formatTicket, daysBetween } from '../../utils/formatters';

export default function OfficerDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useApi(() => api.analytics.officer(), []);
  const { data: complaints, loading } = useApi(() => api.complaints.list({ officerId: user.id }), [user.id]);
  const navigate = useNavigate();

  // Queue = active work, ordered by priority weight then age (SLA pressure).
  const queue = (complaints || [])
    .filter((c) => [STATUS.ASSIGNED, STATUS.IN_PROGRESS].includes(c.status))
    .sort((a, b) => (PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight) || (new Date(a.createdAt) - new Date(b.createdAt)))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={`${ROLE_LABELS[user.role]} · ${user.designation || ''}`}
        title={`Good day, ${user.fullName.split(' ')[0]}`}
        subtitle="Your assigned complaints and current workload."
      />

      {statsLoading ? <Loader /> : (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3"><StatCard label="Total assigned" value={stats.assigned} icon="bi-inboxes" variant="primary" /></div>
          <div className="col-6 col-lg-3"><StatCard label="Awaiting action" value={stats.pending} icon="bi-hourglass-split" variant="warning" /></div>
          <div className="col-6 col-lg-3"><StatCard label="In progress" value={stats.inProgress} icon="bi-gear-wide-connected" variant="info" /></div>
          <div className="col-6 col-lg-3"><StatCard label="Resolved" value={stats.resolved} icon="bi-check2-circle" variant="success" /></div>
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span><i className="bi bi-list-check me-2" />Priority work queue</span>
          <Link to="/officer/complaints" className="btn btn-sm btn-light">All assigned <i className="bi bi-arrow-right-short" /></Link>
        </div>
        <div className="card-body p-0">
          {loading ? <Loader /> : queue.length === 0 ? (
            <EmptyState icon="bi-emoji-smile" title="You're all caught up" message="No complaints are currently awaiting your action." />
          ) : (
            <div className="list-group list-group-flush">
              {queue.map((c) => {
                const age = daysBetween(c.createdAt);
                const sla = PRIORITY_META[c.priority].slaDays;
                const overdue = age > sla;
                return (
                  <button key={c.id} className="list-group-item list-group-item-action py-3 text-start border-0" onClick={() => navigate(`/officer/complaints/${c.id}`)}>
                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                      <div>
                        <div className="cp-eyebrow" style={{ fontSize: '0.66rem' }}>{formatTicket(c.id, c.createdAt)}</div>
                        <div className="fw-semibold">{c.title}</div>
                        <small className="text-muted">{c.wardName} · {c.landmark}</small>
                      </div>
                      <div className="text-end d-flex flex-column gap-1 align-items-end">
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                        <small className={overdue ? 'text-danger fw-semibold' : 'text-muted'}>
                          {overdue ? <><i className="bi bi-exclamation-triangle me-1" />{age - sla}d overdue</> : `${sla - age}d to SLA`}
                        </small>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
