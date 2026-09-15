import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { formatTicket, formatDate, formatDateTime } from '../../utils/formatters';
import { CATEGORIES, STATUS } from '../../utils/constants';

export default function ComplaintDetail() {
  useDocumentTitle('Complaint details');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: complaint, loading, error, refetch } = useApi(() => api.complaints.get(id), [id]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  if (loading) return <Loader full />;
  if (error || !complaint) {
    return <EmptyState icon="bi-exclamation-triangle" title="Complaint not found" message="This complaint may have been removed or the link is incorrect."
      action={<Link to="/citizen/complaints" className="btn btn-primary btn-sm">Back to my complaints</Link>} />;
  }

  const canRate = [STATUS.RESOLVED, STATUS.CLOSED].includes(complaint.status);

  const submitFeedback = async () => {
    if (!rating) { toast.warning('Please select a star rating first.'); return; }
    setSavingFeedback(true);
    try {
      await api.feedback.submit(complaint.id, { rating, comment });
      toast.success('Thank you for your feedback!');
      setComment('');
      setRating(0);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not submit feedback.');
    } finally {
      setSavingFeedback(false);
    }
  };

  return (
    <div>
      <button className="btn btn-sm btn-light mb-3" onClick={() => navigate('/citizen/complaints')}>
        <i className="bi bi-arrow-left me-1" />Back to my complaints
      </button>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card card-body p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <div className="cp-eyebrow">{formatTicket(complaint.id, complaint.createdAt)}</div>
                <h3 className="fw-bold mb-1">{complaint.title}</h3>
                <span className="text-muted">
                  <i className={`bi ${CATEGORIES[complaint.category]?.icon} me-1`} />{complaint.categoryLabel}
                </span>
              </div>
              <div className="text-end d-flex flex-column gap-1 align-items-end">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} subtle />
              </div>
            </div>

            <div className="py-4 my-2 border-top border-bottom"><StatusStepper status={complaint.status} /></div>

            <h6 className="fw-bold">Description</h6>
            <p className="text-secondary">{complaint.description}</p>

            <h6 className="fw-bold mt-3">Photo evidence</h6>
            <AttachmentGallery attachments={complaint.attachments} />
          </div>

          {/* Feedback */}
          {canRate && (
            <div className="card card-body p-4">
              <h6 className="fw-bold mb-1"><i className="bi bi-star me-2 text-warning" />Rate this resolution</h6>
              {complaint.feedback ? (
                <div className="alert alert-success mb-0 mt-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <RatingStars value={complaint.feedback.rating} />
                    <span className="small text-muted">submitted {formatDate(complaint.feedback.createdAt)}</span>
                  </div>
                  {complaint.feedback.comment && <p className="mb-0 small">“{complaint.feedback.comment}”</p>}
                  <button className="btn btn-sm btn-link px-0 mt-1" onClick={() => { setRating(complaint.feedback.rating); setComment(complaint.feedback.comment); }}>
                    Update my feedback
                  </button>
                </div>
              ) : null}
              <div className={complaint.feedback ? 'mt-3' : 'mt-2'}>
                <p className="text-muted small mb-2">How satisfied are you with how this complaint was handled?</p>
                <RatingStars value={rating} onChange={setRating} readOnly={false} size="1.6rem" />
                <textarea className="form-control mt-3" rows={3} placeholder="Share any additional comments (optional)…" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button className="btn btn-primary mt-3" onClick={submitFeedback} disabled={savingFeedback}>
                  {savingFeedback ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit feedback'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card card-body p-4 mb-4">
            <h6 className="fw-bold mb-3">Details</h6>
            <dl className="row small mb-0">
              <dt className="col-5 text-muted fw-normal">Department</dt><dd className="col-7 fw-semibold">{complaint.departmentName}</dd>
              <dt className="col-5 text-muted fw-normal">Ward</dt><dd className="col-7">{complaint.wardName}</dd>
              <dt className="col-5 text-muted fw-normal">Landmark</dt><dd className="col-7">{complaint.landmark}</dd>
              {complaint.pincode && (<><dt className="col-5 text-muted fw-normal">PIN code</dt><dd className="col-7">{complaint.pincode}</dd></>)}
              <dt className="col-5 text-muted fw-normal">Assigned officer</dt><dd className="col-7">{complaint.assignedOfficerName || <span className="text-muted">Not yet assigned</span>}</dd>
              <dt className="col-5 text-muted fw-normal">Filed on</dt><dd className="col-7">{formatDateTime(complaint.createdAt)}</dd>
              {complaint.resolvedAt && (<><dt className="col-5 text-muted fw-normal">Resolved on</dt><dd className="col-7">{formatDateTime(complaint.resolvedAt)}</dd></>)}
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
