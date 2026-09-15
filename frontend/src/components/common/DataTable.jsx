import { useMemo, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import Loader from './Loader';

/**
 * Reusable data table with client-side search, column sorting and pagination.
 *
 * columns: [{ key, label, render?(row), sortable?, value?(row), className }]
 * The optional `value(row)` returns the raw value used for sorting/searching
 * when it differs from what `render` displays.
 */
export default function DataTable({
  columns, rows, loading = false, searchable = true, searchPlaceholder = 'Search…',
  pageSize = DEFAULT_PAGE_SIZE, onRowClick, emptyTitle = 'Nothing here yet',
  emptyMessage = 'There are no records to display.', toolbar,
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const debounced = useDebounce(query, 250);

  const rawValue = (col, row) => (col.value ? col.value(row) : row[col.key]);

  const filtered = useMemo(() => {
    let data = [...(rows || [])];
    if (debounced.trim()) {
      const q = debounced.toLowerCase();
      data = data.filter((row) =>
        columns.some((col) => {
          const v = rawValue(col, row);
          return v != null && String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      data.sort((a, b) => {
        const av = rawValue(col, a);
        const bv = rawValue(col, b);
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, debounced, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((s) => (s.key === col.key ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: col.key, dir: 'asc' }));
  };

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          {searchable && (
            <div className="position-relative" style={{ maxWidth: 320, flex: '1 1 240px' }}>
              <i className="bi bi-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-control ps-5"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
            </div>
          )}
          <div className="ms-auto d-flex gap-2 flex-wrap">{toolbar}</div>
        </div>
      )}

      <div className="table-wrap">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.sortable ? 'cursor-pointer user-select-none' : ''} ${col.className || ''}`}
                    onClick={() => toggleSort(col)}
                  >
                    {col.label}
                    {col.sortable && (
                      <i className={`bi ms-1 ${sort.key === col.key ? (sort.dir === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill') : 'bi-arrow-down-up opacity-25'}`} style={{ fontSize: '0.7em' }} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length}><Loader label="Loading records…" /></td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={columns.length}><EmptyState icon="bi-search" title={emptyTitle} message={emptyMessage} /></td></tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={row.id ?? idx}
                    className={onRowClick ? 'cursor-pointer' : ''}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ''}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
          <small className="text-muted">
            Showing {pageRows.length ? (current - 1) * pageSize + 1 : 0}–{(current - 1) * pageSize + pageRows.length} of {filtered.length}
          </small>
          <Pagination page={current} pageCount={pageCount} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
