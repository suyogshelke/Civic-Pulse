import { PRIORITY_META } from '../../utils/constants';

export default function PriorityBadge({ priority, subtle = false, className = '' }) {
  const meta = PRIORITY_META[priority] || { label: priority, variant: 'secondary', icon: 'bi-dash' };
  const cls = subtle ? `badge badge-soft text-${meta.variant}` : `badge text-bg-${meta.variant}`;
  return (
    <span className={`${cls} d-inline-flex align-items-center gap-1 ${className}`}>
      <i className={`bi ${meta.icon}`} style={{ fontSize: '0.8em' }} />
      {meta.label}
    </span>
  );
}
