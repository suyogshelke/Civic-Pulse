import { STATUS_META } from '../../utils/constants';

/** Coloured pill for a complaint status, with matching icon. */
export default function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] || { label: status, variant: 'secondary', icon: 'bi-dot' };
  return (
    <span className={`badge text-bg-${meta.variant} d-inline-flex align-items-center gap-1 ${className}`}>
      <i className={`bi ${meta.icon}`} style={{ fontSize: '0.8em' }} />
      {meta.label}
    </span>
  );
}
