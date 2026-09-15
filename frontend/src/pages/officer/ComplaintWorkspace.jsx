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
import StatusStepper from '../../components/complaints/StatusStepper';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import AttachmentGallery from '../../components/complaints/AttachmentGallery';
import ImageUploader from '../../components/complaints/ImageUploader';
import { formatTicket, formatDateTime, daysBetween } from '../../utils/formatters';
import { CATEGORIES, STATUS, STATUS_META, nextStatuses, PRIORITY_META } from '../../utils/constants';

/** Officer's action workspace for a single complaint. */
export default function ComplaintWorkspace() {
  useDocumentTitle('Complaint workspace');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: complaint, loading, error, refetch } = useApi(() => api.complaints.get(id), [id]);

  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader full />;
  if (error || !complaint) {
    return <EmptyState icon="bi-exclamation-triangle" title="Complaint not found" message="This complaint is unavailable." />;
  }

  const options = nextStatuses(complaint.status);
  const age = daysBetween(complaint.createdAt);
  const sla = PRIORITY_META[complaint.priority].slaDays;

  const act = async (toStatus) => {
    const needsRemark = [STATUS.RESOLVED, STATUS.REJECTED].includes(toStatus);
    if (needsRemark && !remark.trim()) {
      toast.warning('Please add a remark describing the action taken.');
      return;
    }
    setBusy(true);
    try {
      await api.complaints.transition(complaint.id, {
        toStatus,
        remark: remark.trim() || `Marked as ${STATUS_META[toStatus].label}.`,
        resolutionNote: toStatus === STATUS.RESOLVED ? remark.trim() : undefined,
        files: files.length ? files : undefined,
      });
      toast.success(`Complaint moved to “${STATUS_META[toStatus].label}”.`);
      setRemark('');
      setFiles([]);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the complaint.');
    } finally {
      setBusy(false);
    }
  };

  const addRemarkOnly = async () => {
    if (!remark.trim()) { toast.warning('Enter a remark first.'); return; }
    setBusy(true);
    try {
      await api.complaints.transition(complaint.id, { remark: remark.trim(), files: files.length ? files : undefined });
      toast.success('Remark added.');
      setRemark('');
      setFiles([]);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not add remark.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button className="btn btn-sm btn-light mb-3" onClick={() => navigate('/officer/complaints')}>
        <i className="bi bi-arrow-left me-1" />Back to assigned complaints
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
                <small className={age > sla ? 'text-danger fw-semibold' : 'text-muted'}>
                  {age > sla ? `${age - sla} days overdue` : `${sla - age} days to SLA`}
                </small>
              </div>
            </div>

            <div className="py-4 my-2 border-top border-bottom"><StatusStepper status={complaint.status} /></div>

            <h6 className="fw-bold">Description</h6>
            <p className="text-secondary">{complaint.description}</p>
            <h6 className="fw-bold mt-3">Citizen&apos;s evidence</h6>
            <AttachmentGallery attachments={(complaint.attachments || []).filter((a) => !a.resolution)} />
          </div>

          {/* Action panel */}
          <div className="card card-body p-4">
            <h6 className="fw-bold mb-1"><i className="bi bi-tools me-2 text-primary" />Take action</h6>
            {options.length === 0 ? (
              <div className="alert alert-secondary mb-0 mt-2">
                This complaint is <strong>{STATUS_META[complaint.status].label.toLowerCase()}</strong> and needs no further action.
              </div>
            ) : (
              <>
                <p className="text-muted small mb-2">Add a remark (and optional resolution photos), then choose the next step.</p>
                <textarea className="form-control" rows={3} placeholder="Describe the inspection, work done, or reason…" value={remark} onChange={(e) => setRemark(e.target.value)} />
                {[STATUS.IN_PROGRESS, STATUS.RESOLVED].includes(complaint.status) || options.includes(STATUS.RESOLVED) ? (
                  <div className="mt-3">
                    <label className="form-label">Resolution / progress photos <span className="text-muted fw-normal">(optional)</span></label>
                    <ImageUploader files={files} onChange={setFiles} />
                  </div>
                ) : null}

                <div className="d-flex flex-wrap gap-2 mt-3">
                  {options.map((st) => {
                    const meta = STATUS_META[st];
                    const variant = st === STATUS.REJECTED ? 'outline-danger' : st === STATUS.RESOLVED ? 'success' : 'primary';
                    return (
                      <button key={st} className={`btn btn-${variant}`} onClick={() => act(st)} disabled={busy}>
                        <i className={`bi ${meta.icon} me-1`} />Move to {meta.label}
                      </button>
                    );
                  })}
                  <button className="btn btn-light ms-auto" onClick={addRemarkOnly} disabled={busy}>
                    <i className="bi bi-chat-left-text me-1" />Add remark only
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-body p-4 mb-4">
            <h6 className="fw-bold mb-3">Complaint details</h6>
            <dl className="row small mb-0">
              <dt className="col-5 text-muted fw-normal">Reported by</dt><dd className="col-7 fw-semibold">{complaint.citizenName}</dd>
              <dt className="col-5 text-muted fw-normal">Department</dt><dd className="col-7">{complaint.departmentName}</dd>
              <dt className="col-5 text-muted fw-normal">Ward</dt><dd className="col-7">{complaint.wardName}</dd>
              <dt className="col-5 text-muted fw-normal">Landmark</dt><dd className="col-7">{complaint.landmark}</dd>
              {complaint.pincode && (<><dt className="col-5 text-muted fw-normal">PIN</dt><dd className="col-7">{complaint.pincode}</dd></>)}
              <dt className="col-5 text-muted fw-normal">Filed</dt><dd className="col-7">{formatDateTime(complaint.createdAt)}</dd>
            </dl>
            {complaint.latitude && (
              <a className="btn btn-sm btn-light w-100 mt-3" href={`https://www.openstreetmap.org/?mlat=${complaint.latitude}&mlon=${complaint.longitude}#map=17/${complaint.latitude}/${complaint.longitude}`} target="_blank" rel="noreferrer">
                <i className="bi bi-geo-alt me-1" />View location on map
              </a>
            )}
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
