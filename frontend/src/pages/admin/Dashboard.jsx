import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import TrendChart from '../../components/charts/TrendChart';
import StatusDonut from '../../components/charts/StatusDonut';
import { STATUS_META, PRIORITY_META, STATUS } from '../../utils/constants';
import { formatTicket, timeAgo, formatNumber } from '../../utils/formatters';

export default function AdminDashboard() {
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();
  const { data: a, loading } = useApi(() => api.analytics.overview(), []);
  const { data: complaints } = useApi(() => api.complaints.list({}), []);

  if (loading || !a) return <Loader full />;

  const statusData = Object.entries(a.byStatus).map(([key, value]) => ({ key, name: STATUS_META[key]?.label || key, value }));
  const attention = (complaints || [])
    .filter((c) => c.priority === 'CRITICAL' && ![STATUS.RESOLVED, STATUS.CLOSED].includes(c.status))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Administrator"
        title="System overview"
        subtitle="A real-time pulse of civic complaints across all departments."
        actions={<Link to="/admin/reports" className="btn btn-outline-primary"><i className="bi bi-download me-2" />Export reports</Link>}
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="Total complaints" value={formatNumber(a.totals.total)} icon="bi-card-list" variant="primary" hint={`${a.totals.citizens} citizens`} /></div>
        <div className="col-6 col-lg-3"><StatCard label="Pending" value={formatNumber(a.totals.pending)} icon="bi-hourglass-split" variant="warning" hint="awaiting resolution" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Resolution rate" value={`${a.totals.resolutionRate}%`} icon="bi-graph-up-arrow" variant="success" hint={`avg ${a.totals.avgResolutionDays} days`} /></div>
        <div className="col-6 col-lg-3"><StatCard label="Critical open" value={formatNumber(a.totals.critical)} icon="bi-exclamation-triangle" variant="danger" hint="need attention" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">Complaints trend — last 6 months</div>
            <div className="card-body"><TrendChart data={a.trend} /></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">By status</div>
            <div className="card-body"><StatusDonut data={statusData} /></div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-building me-2" />Department performance</span>
              <Link to="/admin/departments" className="btn btn-sm btn-light">Manage</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr><th>Department</th><th className="text-center">Total</th><th className="text-center">Resolved</th><th style={{ width: 160 }}>Resolution</th></tr></thead>
                  <tbody>
                    {Object.entries(a.byDepartment).map(([name, d]) => {
                      const rate = d.total ? Math.round((d.resolved / d.total) * 100) : 0;
                      return (
                        <tr key={name}>
                          <td className="fw-semibold">{name}</td>
                          <td className="text-center">{d.total}</td>
                          <td className="text-center">{d.resolved}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 6 }}>
                                <div className={`progress-bar bg-${rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'danger'}`} style={{ width: `${rate}%` }} />
                              </div>
                              <small className="text-muted" style={{ width: 34 }}>{rate}%</small>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="text-danger"><i className="bi bi-exclamation-triangle-fill me-2" />Needs attention</span>
              <Link to="/admin/complaints" className="btn btn-sm btn-light">All</Link>
            </div>
            <div className="card-body p-0">
              {attention.length === 0 ? (
                <p className="text-muted small text-center py-4 mb-0">No critical complaints are currently open. 🎉</p>
              ) : (
                <div className="list-group list-group-flush">
                  {attention.map((c) => (
                    <button key={c.id} className="list-group-item list-group-item-action text-start border-0" onClick={() => navigate(`/admin/complaints/${c.id}`)}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="fw-semibold small">{c.title}</div>
                          <small className="text-muted">{formatTicket(c.id, c.createdAt)} · {c.departmentName}</small>
                        </div>
                        <div className="text-end">
                          <PriorityBadge priority={c.priority} />
                          <div><small className="text-muted">{timeAgo(c.createdAt)}</small></div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
