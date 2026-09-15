import { useState } from 'react';
import { CATEGORIES, CATEGORY_KEYS, PRIORITY, PRIORITY_META, WARDS } from '../../utils/constants';
import { validateComplaint, hasErrors } from '../../utils/validators';
import ImageUploader from './ImageUploader';

const EMPTY = {
  title: '', category: '', description: '', ward: '', landmark: '',
  pincode: '', priority: PRIORITY.MEDIUM, latitude: null, longitude: null,
};

/** The citizen complaint submission form, with live validation. */
export default function ComplaintForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const routedDept = form.category ? CATEGORIES[form.category].department : null;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { set({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateComplaint(form);
    setErrors(found);
    if (hasErrors(found)) {
      document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit({ ...form, files });
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Issue title <span className="text-danger">*</span></label>
          <input
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Large pothole near the school gate causing traffic"
            value={form.title}
            maxLength={120}
            onChange={(e) => set({ title: e.target.value })}
          />
          <div className="d-flex justify-content-between">
            <div className="invalid-feedback">{errors.title}</div>
            <small className="text-muted ms-auto">{form.title.length}/120</small>
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Category <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.category ? 'is-invalid' : ''}`} value={form.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="">Select the type of issue…</option>
            {CATEGORY_KEYS.map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
          </select>
          <div className="invalid-feedback">{errors.category}</div>
          {routedDept && <small className="form-text"><i className="bi bi-signpost-2 me-1" />Routes to the <strong>{routedDept}</strong> department</small>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Priority <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.priority ? 'is-invalid' : ''}`} value={form.priority} onChange={(e) => set({ priority: e.target.value })}>
            {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label} — resolve within {PRIORITY_META[p].slaDays} days</option>)}
          </select>
          <div className="invalid-feedback">{errors.priority}</div>
        </div>

        <div className="col-12">
          <label className="form-label">Description <span className="text-danger">*</span></label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            rows={4}
            placeholder="Describe the issue, how long it has persisted, and how it affects the area…"
            value={form.description}
            maxLength={2000}
            onChange={(e) => set({ description: e.target.value })}
          />
          <div className="d-flex justify-content-between">
            <div className="invalid-feedback">{errors.description}</div>
            <small className="text-muted ms-auto">{form.description.length}/2000</small>
          </div>
        </div>

        <div className="col-md-5">
          <label className="form-label">Ward <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.ward ? 'is-invalid' : ''}`} value={form.ward} onChange={(e) => set({ ward: e.target.value })}>
            <option value="">Select ward…</option>
            {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="invalid-feedback">{errors.ward}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Nearby landmark <span className="text-danger">*</span></label>
          <input className={`form-control ${errors.landmark ? 'is-invalid' : ''}`} placeholder="e.g. opposite City Mall" value={form.landmark} onChange={(e) => set({ landmark: e.target.value })} />
          <div className="invalid-feedback">{errors.landmark}</div>
        </div>

        <div className="col-md-3">
          <label className="form-label">PIN code</label>
          <input className={`form-control ${errors.pincode ? 'is-invalid' : ''}`} placeholder="411038" maxLength={6} value={form.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '') })} />
          <div className="invalid-feedback">{errors.pincode}</div>
        </div>

        <div className="col-12">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" className="btn btn-sm btn-light" onClick={useMyLocation} disabled={locating}>
              {locating ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-geo-alt me-1" />}
              Use my current location
            </button>
            {form.latitude && (
              <span className="badge badge-soft"><i className="bi bi-pin-map me-1" />{form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</span>
            )}
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Photo evidence <span className="text-muted fw-normal">(optional but recommended)</span></label>
          <ImageUploader files={files} onChange={setFiles} />
        </div>

        <div className="col-12 d-flex justify-content-end gap-2 pt-2">
          <button type="button" className="btn btn-light" onClick={() => { setForm(EMPTY); setFiles([]); setErrors({}); }} disabled={submitting}>
            Reset
          </button>
          <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : <><i className="bi bi-send me-2" />Submit complaint</>}
          </button>
        </div>
      </div>
    </form>
  );
}
