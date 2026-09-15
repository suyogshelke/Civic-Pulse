import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { formatTicket, formatDate } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';
import StatusStepper from '../../components/complaints/StatusStepper';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import useDocumentTitle from '../../hooks/useDocumentTitle';

/** Public, no-login lookup of a complaint by its numeric id / ticket number. */
export default function TrackComplaint() {
  useDocumentTitle('Track a complaint');
  const [ref, setRef] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setError(null);
    setComplaint(null);
    const id = ref.replace(/\D/g, '').replace(/^0+/, '');
    if (!id) { setError('Enter a complaint number, e.g. 1001 or CIV-2026-001001'); return; }
    setBusy(true);
    try {
      const found = await api.complaints.get(Number(id));
      setComplaint(found);
    } catch {
      setError('No complaint found with that reference number. Please check and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <div className="text-center mb-4">
        <span className="cp-eyebrow">Public tracking</span>
        <h2 className="fw-bold mt-2">Track your complaint</h2>
        <p className="text-muted">Enter the reference number you received when you submitted your complaint.</p>
      </div>

      <form onSubmit={search} className="card p-3 mb-4">
        <div className="input-group input-group-lg">
          <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
          <input className="form-control" placeholder="e.g. 1001 or CIV-2026-001001" value={ref} onChange={(e) => setRef(e.target.value)} />
          <button className="btn btn-primary px-4" disabled={busy}>
            {busy ? <span className="spinner-border spinner-border-sm" /> : 'Track'}
          </button>
        </div>
        {error && <div className="text-danger small mt-2"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      </form>

      {complaint && (
        <div className="card card-elevated">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <div className="cp-eyebrow">{formatTicket(complaint.id, complaint.createdAt)}</div>
                <h4 className="fw-bold mb-1">{complaint.title}</h4>
                <span className="text-muted small">
                  <i className={`bi ${CATEGORIES[complaint.category]?.icon} me-1`} />
                  {complaint.categoryLabel} · {complaint.wardName} · filed {formatDate(complaint.createdAt)}
                </span>
              </div>
              <div className="text-end d-flex flex-column gap-1 align-items-end">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} subtle />
              </div>
            </div>

            <div className="py-3"><StatusStepper status={complaint.status} /></div>

            <hr />
            <h6 className="fw-bold mb-3">Activity</h6>
            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <span className="text-muted small">Want to file a new complaint? </span>
        <Link to="/register" className="fw-semibold">Create an account</Link>
      </div>
    </div>
  );
}
