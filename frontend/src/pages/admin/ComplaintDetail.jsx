import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RatingStars from '../../components/common/RatingStars';
import StatusStepper from '../../components/complaints/StatusStepper';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import AttachmentGallery from '../../components/complaints/AttachmentGallery';
import { formatTicket, formatDateTime } from '../../utils/formatters';
import { CATEGORIES, PRIORITY, PRIORITY_META, STATUS, STATUS_META, nextStatuses } from '../../utils/constants';

/** Admin's full-control view: assign officers, change priority, drive status. */
export default function ComplaintDetail() {
  useDocumentTitle('Complaint details');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: complaint, loading, error, refetch } = useApi(() => api.complaints.get(id), [id]);
  const { data: officers } = useApi(() => api.users.list('OFFICER'), []);

  const [remark, setRemark] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader full />;
  if (error || !complaint) {
    return <EmptyState icon="bi-exclamation-triangle" title="Complaint not found" message="This complaint is unavailable." />;
  }

  // Officers filtered to the complaint's department for sensible assignment.
  const deptOfficers = (officers || []).filter((o) => o.departmentId === complaint.departmentId);
  const statusOptions = nextStatuses(complaint.status);

  const assign = async () => {
    if (!officerId) { toast.warning('Select an officer to assign.'); return; }
    setBusy(true);
    try {
      await api.complaints.assign(complaint.id, Number(officerId), remark.trim() || 'Assigned by administrator.');
      toast.success('Complaint assigned.');
      setOfficerId('');
      setRemark('');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Assignment failed.');
    } finally {
      setBusy(false);
    }
  };

  const changePriority = async (priority) => {
    setBusy(true);
    try {
      await api.complaints.setPriority(complaint.id, priority);
      toast.success(`Priority set to ${PRIORITY_META[priority].label}.`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not change priority.');
    } finally {
      setBusy(false);
    }
  };

  const moveStatus = async (toStatus) => {
    setBusy(true);
    try {
      await api.complaints.transition(complaint.id, { toStatus, remark: remark.trim() || `Status changed to ${STATUS_META[toStatus].label} by administrator.` });
      toast.success(`Moved to “${STATUS_META[toStatus].label}”.`);
      setRemark('');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button className="btn btn-sm btn-light mb-3" onClick={() => navigate('/admin/complaints')}>
        <i className="bi bi-arrow-left me-1" />Back to all complaints
      </button>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card card-body p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <div className="cp-eyebrow">{formatTicket(complaint.id, complaint.createdAt)}</div>
                <h3 className="fw-bold mb-1">{complaint.title}</h3>
                <span className="text-muted"><i className={`bi ${CATEGORIES[complaint.category]?.icon} me-1`} />{complaint.categoryLabel}</span>
              </div>
              <div className="text-end d-flex flex-column gap-1 align-items-end">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>
            <div className="py-4 my-2 border-top border-bottom"><StatusStepper status={complaint.status} /></div>
            <h6 className="fw-bold">Description</h6>
            <p className="text-secondary">{complaint.description}</p>
            <h6 className="fw-bold mt-3">Evidence</h6>
            <AttachmentGallery attachments={complaint.attachments} />

            {complaint.feedback && (
              <div className="alert alert-success mt-3 mb-0">
                <div className="d-flex align-items-center gap-2"><RatingStars value={complaint.feedback.rating} /><strong className="small">Citizen feedback</strong></div>
                {complaint.feedback.comment && <p className="mb-0 small mt-1">“{complaint.feedback.comment}”</p>}
              </div>
            )}
          </div>

          {/* Admin controls */}
          <div className="card card-body p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-sliders me-2 text-primary" />Administration</h6>

            <label className="form-label">Remark <span className="text-muted fw-normal">(attached to any action below)</span></label>
            <textarea className="form-control mb-3" rows={2} placeholder="Optional note for the audit trail…" value={remark} onChange={(e) => setRemark(e.target.value)} />

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Assign / reassign officer</label>
                <div className="input-group">
                  <select className="form-select" value={officerId} onChange={(e) => setOfficerId(e.target.value)}>
                    <option value="">
                      {deptOfficers.length ? 'Select officer…' : 'No officers in this department'}
                    </option>
                    {deptOfficers.map((o) => <option key={o.id} value={o.id}>{o.fullName} — {o.designation}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={assign} disabled={busy || !officerId}>Assign</button>
                </div>
                {complaint.assignedOfficerName && <small className="form-text">Currently: <strong>{complaint.assignedOfficerName}</strong></small>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Change priority</label>
                <div className="btn-group w-100">
                  {Object.values(PRIORITY).map((p) => (
                    <button
                      key={p}
                      className={`btn btn-sm ${complaint.priority === p ? `btn-${PRIORITY_META[p].variant}` : 'btn-outline-secondary'}`}
                      onClick={() => changePriority(p)}
                      disabled={busy || complaint.priority === p}
                    >
                      {PRIORITY_META[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Move status</label>
                <div className="d-flex flex-wrap gap-2">
                  {statusOptions.length === 0 ? (
                    <span className="text-muted small">No further transitions available from “{STATUS_META[complaint.status].label}”.</span>
                  ) : statusOptions.map((st) => (
                    <button key={st} className={`btn btn-sm ${st === STATUS.REJECTED ? 'btn-outline-danger' : 'btn-outline-primary'}`} onClick={() => moveStatus(st)} disabled={busy}>
                      <i className={`bi ${STATUS_META[st].icon} me-1`} />{STATUS_META[st].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-body p-4 mb-4">
            <h6 className="fw-bold mb-3">Details</h6>
            <dl className="row small mb-0">
              <dt className="col-5 text-muted fw-normal">Reported by</dt><dd className="col-7 fw-semibold">{complaint.citizenName}</dd>
              <dt className="col-5 text-muted fw-normal">Department</dt><dd className="col-7">{complaint.departmentName}</dd>
              <dt className="col-5 text-muted fw-normal">Officer</dt><dd className="col-7">{complaint.assignedOfficerName || '—'}</dd>
              <dt className="col-5 text-muted fw-normal">Ward</dt><dd className="col-7">{complaint.wardName}</dd>
              <dt className="col-5 text-muted fw-normal">Landmark</dt><dd className="col-7">{complaint.landmark}</dd>
              <dt className="col-5 text-muted fw-normal">Filed</dt><dd className="col-7">{formatDateTime(complaint.createdAt)}</dd>
              {complaint.resolvedAt && (<><dt className="col-5 text-muted fw-normal">Resolved</dt><dd className="col-7">{formatDateTime(complaint.resolvedAt)}</dd></>)}
            </dl>
          </div>
          <div className="card card-body p-4">
            <h6 className="fw-bold mb-3">Activity timeline</h6>
            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
