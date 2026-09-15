/** Numeric pager with prev/next. Hides itself when there is a single page. */
export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const pages = [];
  const push = (p) => pages.push(p);
  const window = 1;
  for (let p = 1; p <= pageCount; p += 1) {
    if (p === 1 || p === pageCount || (p >= page - window && p <= page + window)) push(p);
    else if (pages[pages.length - 1] !== '…') push('…');
  }

  return (
    <nav className="d-flex justify-content-center mt-3">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>
            <i className="bi bi-chevron-left" />
          </button>
        </li>
        {pages.map((p, i) =>
          p === '…' ? (
            <li key={`gap-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onChange(p)}>{p}</button>
            </li>
          ),
        )}
        <li className={`page-item ${page === pageCount ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
