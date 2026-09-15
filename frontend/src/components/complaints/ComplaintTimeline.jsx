import { STATUS_META } from '../../utils/constants';
import { formatDateTime, timeAgo } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';

/** Vertical audit trail of every status change and remark on a complaint. */
export default function ComplaintTimeline({ timeline = [] }) {
  if (!timeline.length) return <p className="text-muted small mb-0">No activity recorded yet.</p>;
  return (
    <div className="timeline">
      {timeline.map((entry, idx) => {
        const meta = STATUS_META[entry.toStatus] || {};
        const isLast = idx === timeline.length - 1;
        return (
          <div className="timeline-item" key={entry.id}>
            <span className={`timeline-dot ${isLast ? 'current' : 'done'}`}>
              {!isLast && <i className="bi bi-check" style={{ fontSize: '0.6rem', color: '#fff' }} />}
            </span>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-1">
              <span className={`badge text-bg-${meta.variant || 'secondary'}`}>
                <i className={`bi ${meta.icon || 'bi-dot'} me-1`} />{meta.label || entry.toStatus}
              </span>
              <small className="text-muted" title={formatDateTime(entry.createdAt)}>{timeAgo(entry.createdAt)}</small>
            </div>
            {entry.remark && <p className="mb-1 mt-2 small">{entry.remark}</p>}
            <small className="text-muted">
              <i className="bi bi-person-circle me-1" />
              {entry.byName} · {ROLE_LABELS[entry.byRole] || entry.byRole}
            </small>
          </div>
        );
      })}
    </div>
  );
}
