/** Spinner. `full` centres it in a full-height viewport for route loading. */
export default function Loader({ full = false, label = 'Loading…', size = 'md' }) {
  const dim = size === 'sm' ? 'spinner-border-sm' : '';
  const spinner = (
    <div className="text-center">
      <div className={`spinner-border text-primary ${dim}`} role="status" style={{ borderWidth: 3 }}>
        <span className="visually-hidden">{label}</span>
      </div>
      {label && <div className="text-muted mt-2 small">{label}</div>}
    </div>
  );
  if (full) {
    return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>{spinner}</div>;
  }
  return <div className="py-4">{spinner}</div>;
}
