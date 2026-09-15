import { STATUS, STATUS_META, PRIORITY, PRIORITY_META, CATEGORIES, CATEGORY_KEYS, WARDS } from '../../utils/constants';

/**
 * Reusable filter bar for complaint lists. `show` controls which filters
 * appear so each portal can expose only what is relevant to it.
 */
export default function ComplaintFilters({ value, onChange, show = ['status', 'priority', 'category'] }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const has = (f) => show.includes(f);

  return (
    <div className="d-flex flex-wrap gap-2">
      {has('status') && (
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={value.status || ''} onChange={(e) => set({ status: e.target.value })}>
          <option value="">All statuses</option>
          {Object.values(STATUS).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
      )}
      {has('priority') && (
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={value.priority || ''} onChange={(e) => set({ priority: e.target.value })}>
          <option value="">All priorities</option>
          {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
        </select>
      )}
      {has('category') && (
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={value.category || ''} onChange={(e) => set({ category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORY_KEYS.map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
        </select>
      )}
      {has('ward') && (
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={value.ward || ''} onChange={(e) => set({ ward: e.target.value })}>
          <option value="">All wards</option>
          {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      )}
      {Object.keys(value).some((k) => value[k]) && (
        <button className="btn btn-sm btn-light" onClick={() => onChange({})}>
          <i className="bi bi-x-circle me-1" />Clear
        </button>
      )}
    </div>
  );
}
