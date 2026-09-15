/** Friendly empty-state placeholder with an optional call to action. */
export default function EmptyState({ icon = 'bi-inbox', title, message, action }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <h5 className="mt-3 mb-1">{title}</h5>
      {message && <p className="mb-3">{message}</p>}
      {action}
    </div>
  );
}
