import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import TrendChart from '../../components/charts/TrendChart';
import StatusDonut from '../../components/charts/StatusDonut';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import { STATUS_META, CATEGORIES, PRIORITY_META } from '../../utils/constants';
import { formatNumber } from '../../utils/formatters';

export default function Analytics() {
  useDocumentTitle('Analytics');
  const { data: a, loading } = useApi(() => api.analytics.overview(), []);
  if (loading || !a) return <Loader full />;

  const statusData = Object.entries(a.byStatus).map(([key, value]) => ({ key, name: STATUS_META[key]?.label || key, value }));
  const categoryData = Object.entries(a.byCategory)
    .map(([key, value]) => ({ name: CATEGORIES[key]?.label || key, value }))
    .sort((x, y) => y.value - x.value);
  const wardData = Object.entries(a.byWard).map(([name, value]) => ({ name, value })).sort((x, y) => y.value - x.value);
  const priorityData = Object.entries(a.byPriority).map(([key, value]) => ({ name: PRIORITY_META[key]?.label || key, value, key }));

  return (
    <>
      <PageHeader eyebrow="Insights" title="Analytics" subtitle="Complaint distribution, trends and performance across the system." />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="Total complaints" value={formatNumber(a.totals.total)} icon="bi-card-list" variant="primary" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Avg resolution" value={`${a.totals.avgResolutionDays}d`} icon="bi-clock-history" variant="info" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Resolution rate" value={`${a.totals.resolutionRate}%`} icon="bi-graph-up-arrow" variant="success" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Avg citizen rating" value={`${a.totals.avgRating} ★`} icon="bi-star-fill" variant="warning" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card h-100"><div className="card-header">Submitted vs resolved — 6-month trend</div><div className="card-body"><TrendChart data={a.trend} height={300} /></div></div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100"><div className="card-header">Status distribution</div><div className="card-body"><StatusDonut data={statusData} height={300} /></div></div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header">Complaints by category</div><div className="card-body"><CategoryBarChart data={categoryData} height={340} /></div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header">Complaints by ward</div><div className="card-body"><CategoryBarChart data={wardData} height={340} /></div></div>
        </div>
      </div>

      <div className="row g-4 mt-0">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Priority breakdown</div>
            <div className="card-body">
              <div className="row g-3">
                {priorityData.map((p) => {
                  const meta = PRIORITY_META[p.key];
                  const pct = a.totals.total ? Math.round((p.value / a.totals.total) * 100) : 0;
                  return (
                    <div className="col-6 col-md-3" key={p.key}>
                      <div className="d-flex justify-content-between"><span className="fw-semibold">{p.name}</span><span className="text-muted">{p.value}</span></div>
                      <div className="progress mt-1" style={{ height: 8 }}>
                        <div className={`progress-bar bg-${meta.variant}`} style={{ width: `${pct}%` }} />
                      </div>
                      <small className="text-muted">{pct}% of all · SLA {meta.slaDays}d</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
