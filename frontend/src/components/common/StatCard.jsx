/** Compact KPI tile used across all three dashboards. */
export default function StatCard({ label, value, icon, variant = 'primary', hint, trend }) {
  const tint = {
    primary: 'rgba(21,82,163,0.12)', success: 'rgba(25,135,84,0.14)',
    warning: 'rgba(244,160,44,0.16)', danger: 'rgba(220,53,69,0.13)',
    info: 'rgba(15,179,166,0.14)', dark: 'rgba(15,37,64,0.10)',
  }[variant] || 'rgba(21,82,163,0.12)';
  const color = {
    primary: '#1552a3', success: '#198754', warning: '#c9820f',
    danger: '#dc3545', info: '#0a8f85', dark: '#0f2540',
  }[variant] || '#1552a3';

  return (
    <div className="stat-card hover-lift">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && (
          <div className="stat-icon" style={{ background: tint, color }}>
            <i className={`bi ${icon}`} />
          </div>
        )}
      </div>
      {(hint || trend) && (
        <div className="mt-2 small d-flex align-items-center gap-2">
          {trend && (
            <span className={`fw-semibold ${trend.dir === 'up' ? 'text-success' : 'text-danger'}`}>
              <i className={`bi ${trend.dir === 'up' ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} /> {trend.value}
            </span>
          )}
          {hint && <span className="text-muted">{hint}</span>}
        </div>
      )}
    </div>
  );
}
