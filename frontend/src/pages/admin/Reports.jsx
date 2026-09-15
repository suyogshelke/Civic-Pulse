import { api } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { toCsv, downloadCsv } from '../../utils/csv';
import { formatTicket, formatDate, formatNumber } from '../../utils/formatters';
import { CATEGORIES, PRIORITY_META, STATUS_META } from '../../utils/constants';

const today = () => new Date().toISOString().slice(0, 10);

export default function Reports() {
  useDocumentTitle('Reports');
  const toast = useToast();
  const { data: analytics, loading: la } = useApi(() => api.analytics.overview(), []);
  const { data: complaints, loading: lc } = useApi(() => api.complaints.list({}), []);
  const { data: officers, loading: lo } = useApi(() => api.users.list('OFFICER'), []);

  if (la || lc || lo || !analytics) return <Loader full />;

  const exportRegister = () => {
    const csv = toCsv(complaints, [
      { label: 'Reference', value: (r) => formatTicket(r.id, r.createdAt) },
      { label: 'Title', key: 'title' },
      { label: 'Category', value: (r) => r.categoryLabel },
      { label: 'Department', key: 'departmentName' },
      { label: 'Officer', value: (r) => r.assignedOfficerName || 'Unassigned' },
      { label: 'Priority', value: (r) => PRIORITY_META[r.priority].label },
      { label: 'Status', value: (r) => STATUS_META[r.status].label },
      { label: 'Ward', key: 'wardName' },
      { label: 'Landmark', key: 'landmark' },
      { label: 'Citizen', key: 'citizenName' },
      { label: 'Filed on', value: (r) => formatDate(r.createdAt) },
      { label: 'Resolved on', value: (r) => (r.resolvedAt ? formatDate(r.resolvedAt) : '') },
      { label: 'Rating', value: (r) => (r.feedback ? r.feedback.rating : '') },
    ]);
    downloadCsv(`civic-pulse_complaints_${today()}.csv`, csv);
    toast.success('Complaint register exported.');
  };

  const exportDepartments = () => {
    const rows = Object.entries(analytics.byDepartment).map(([name, d]) => ({
      name, total: d.total, resolved: d.resolved,
      pending: d.total - d.resolved,
      rate: d.total ? Math.round((d.resolved / d.total) * 100) : 0,
    }));
    const csv = toCsv(rows, [
      { label: 'Department', key: 'name' },
      { label: 'Total complaints', key: 'total' },
      { label: 'Resolved', key: 'resolved' },
      { label: 'Pending', key: 'pending' },
      { label: 'Resolution rate (%)', key: 'rate' },
    ]);
    downloadCsv(`civic-pulse_departments_${today()}.csv`, csv);
    toast.success('Department summary exported.');
  };

  const exportCategories = () => {
    const rows = Object.entries(analytics.byCategory)
      .map(([key, value]) => ({ category: CATEGORIES[key]?.label || key, value }))
      .sort((a, b) => b.value - a.value);
    const csv = toCsv(rows, [
      { label: 'Category', key: 'category' },
      { label: 'Complaints', key: 'value' },
    ]);
    downloadCsv(`civic-pulse_categories_${today()}.csv`, csv);
    toast.success('Category summary exported.');
  };

  const exportOfficers = () => {
    const csv = toCsv(officers, [
      { label: 'Officer', key: 'fullName' },
      { label: 'Email', key: 'email' },
      { label: 'Department', key: 'departmentName' },
      { label: 'Designation', key: 'designation' },
      { label: 'Assigned complaints', value: (r) => r.assignedCount ?? 0 },
      { label: 'Status', value: (r) => (r.active ? 'Active' : 'Inactive') },
    ]);
    downloadCsv(`civic-pulse_officers_${today()}.csv`, csv);
    toast.success('Officer performance exported.');
  };

  const reports = [
    { title: 'Complaint register', desc: 'Every complaint with category, department, officer, status, ward and rating.', icon: 'bi-card-list', count: `${complaints.length} records`, action: exportRegister },
    { title: 'Department summary', desc: 'Totals, resolved counts and resolution rate for each department.', icon: 'bi-building', count: `${Object.keys(analytics.byDepartment).length} departments`, action: exportDepartments },
    { title: 'Category summary', desc: 'Complaint volume broken down by civic issue category.', icon: 'bi-tags', count: `${Object.keys(analytics.byCategory).length} categories`, action: exportCategories },
    { title: 'Officer performance', desc: 'Workload and status for every field officer.', icon: 'bi-person-badge', count: `${officers.length} officers`, action: exportOfficers },
  ];

  return (
    <>
      <PageHeader eyebrow="Reporting" title="Reports &amp; exports" subtitle="Download CSV extracts for record-keeping, audits and municipal review meetings." />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="Total complaints" value={formatNumber(analytics.totals.total)} icon="bi-card-list" variant="primary" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Resolved" value={formatNumber(analytics.totals.resolved)} icon="bi-check2-circle" variant="success" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Pending" value={formatNumber(analytics.totals.pending)} icon="bi-hourglass-split" variant="warning" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Resolution rate" value={`${analytics.totals.resolutionRate}%`} icon="bi-graph-up-arrow" variant="info" /></div>
      </div>

      <div className="row g-4">
        {reports.map((r) => (
          <div className="col-md-6" key={r.title}>
            <div className="card card-body p-4 h-100 hover-lift">
              <div className="d-flex align-items-start gap-3">
                <div className="stat-icon text-primary"><i className={`bi ${r.icon}`} /></div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">{r.title}</h6>
                  <p className="text-secondary small mb-2">{r.desc}</p>
                  <span className="badge badge-soft">{r.count}</span>
                </div>
              </div>
              <button className="btn btn-outline-primary mt-3 w-100" onClick={r.action}>
                <i className="bi bi-download me-2" />Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
