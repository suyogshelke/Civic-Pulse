import { useState } from 'react';
import { api, USE_MOCK } from '../../api';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  APP_NAME, APP_TAGLINE, CITY, STATE, CATEGORY_KEYS, WARDS, PRIORITY, PRIORITY_META,
} from '../../utils/constants';

export default function Settings() {
  useDocumentTitle('Settings');
  const toast = useToast();
  const { data: departments } = useApi(() => api.departments.list(), []);

  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const resetData = async () => {
    setBusy(true);
    try {
      await api.system.reset();
      toast.success('Demo data restored to its original state. Reloading…');
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      toast.error(err.message || 'Could not reset the demo data.');
      setBusy(false);
      setConfirm(false);
    }
  };

  const info = [
    { label: 'Application', value: APP_NAME },
    { label: 'Version', value: '1.0.0' },
    { label: 'Jurisdiction', value: `${CITY}, ${STATE}` },
    { label: 'Backend mode', value: USE_MOCK ? 'In-browser mock' : 'Spring Boot API' },
    { label: 'Departments', value: (departments || []).length || '—' },
    { label: 'Issue categories', value: CATEGORY_KEYS.length },
    { label: 'Wards covered', value: WARDS.length },
  ];

  return (
    <>
      <PageHeader eyebrow="Configuration" title="System settings" subtitle={APP_TAGLINE} />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card card-body p-4 h-100">
            <h6 className="fw-bold mb-3"><i className="bi bi-info-circle me-2 text-primary" />System information</h6>
            <dl className="row small mb-0">
              {info.map((row) => (
                <div className="col-12 d-flex justify-content-between py-2 border-bottom" key={row.label}>
                  <dt className="text-muted fw-normal mb-0">{row.label}</dt>
                  <dd className="fw-semibold mb-0">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-body p-4 h-100">
            <h6 className="fw-bold mb-3"><i className="bi bi-stopwatch me-2 text-primary" />Service-level targets</h6>
            <p className="text-secondary small">Target resolution windows applied to each priority level.</p>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Priority</th><th className="text-center">SLA target</th></tr></thead>
                <tbody>
                  {Object.values(PRIORITY).map((p) => (
                    <tr key={p}>
                      <td><PriorityBadge priority={p} /></td>
                      <td className="text-center fw-semibold">{PRIORITY_META[p].slaDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card card-body p-4">
            <h6 className="fw-bold mb-2"><i className="bi bi-hdd-network me-2 text-primary" />Connecting the Spring Boot backend</h6>
            <p className="text-secondary small mb-2">
              {USE_MOCK
                ? 'The app is currently running against the built-in mock backend, so it works with no server. To connect the real Java API, set '
                : 'The app is currently pointed at the live Spring Boot API. To return to the offline mock, set '}
              <code>VITE_USE_MOCK_API</code> in <code>frontend/.env</code>
              {USE_MOCK ? ' to ' : ' to '}<code>{USE_MOCK ? 'false' : 'true'}</code>, then start the backend on <code>http://localhost:8080</code> and restart the dev server.
            </p>
            <span className={`badge ${USE_MOCK ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'}`}>
              <i className={`bi ${USE_MOCK ? 'bi-cpu' : 'bi-check-circle'} me-1`} />
              {USE_MOCK ? 'Mock backend active' : 'Live API connected'}
            </span>
          </div>
        </div>

        {USE_MOCK && (
          <div className="col-12">
            <div className="card card-body p-4 border-danger-subtle">
              <h6 className="fw-bold text-danger mb-2"><i className="bi bi-exclamation-octagon me-2" />Danger zone</h6>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <p className="text-secondary small mb-0" style={{ maxWidth: 560 }}>
                  Restore all demo data — complaints, officers, citizens and departments — to the original seeded state.
                  This clears any changes you made during this session and cannot be undone.
                </p>
                <button className="btn btn-outline-danger" onClick={() => setConfirm(true)} disabled={busy}>
                  <i className="bi bi-arrow-counterclockwise me-2" />Reset demo data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirm}
        title="Reset all demo data?"
        message="Every complaint, account and department will be restored to the original seeded demo state. This cannot be undone."
        confirmLabel="Reset everything"
        variant="danger"
        busy={busy}
        onConfirm={resetData}
        onCancel={() => !busy && setConfirm(false)}
      />
    </>
  );
}
