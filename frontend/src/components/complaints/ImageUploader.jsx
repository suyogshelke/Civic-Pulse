import { useRef, useState } from 'react';
import { UPLOAD_RULES } from '../../utils/constants';
import { validateFile } from '../../utils/validators';
import { formatBytes } from '../../utils/formatters';

/**
 * Drag-and-drop evidence uploader with client-side previews.
 * Enforces the count/size/type rules and reports errors inline.
 */
export default function ImageUploader({ files, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const addFiles = (incoming) => {
    setLocalError(null);
    const list = Array.from(incoming);
    const room = UPLOAD_RULES.maxFiles - files.length;
    if (room <= 0) {
      setLocalError(`You can attach at most ${UPLOAD_RULES.maxFiles} images.`);
      return;
    }
    const accepted = [];
    for (const file of list.slice(0, room)) {
      const problem = validateFile(file);
      if (problem) { setLocalError(problem); continue; }
      accepted.push(file);
    }
    if (accepted.length) onChange([...files, ...accepted]);
  };

  const removeAt = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        className={`border rounded-3 p-4 text-center ${dragging ? 'border-primary bg-light' : 'border-2 border-dashed'}`}
        style={{ borderStyle: 'dashed', cursor: 'pointer', background: dragging ? 'var(--cp-surface-2)' : 'transparent' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
      >
        <i className="bi bi-cloud-arrow-up fs-2 text-primary" />
        <div className="fw-semibold mt-2">Drag photos here or click to browse</div>
        <div className="text-muted small">
          JPG, PNG or WebP · up to {UPLOAD_RULES.maxSizeMb} MB each · max {UPLOAD_RULES.maxFiles} images
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_RULES.accept}
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {(localError || error) && <div className="text-danger small mt-2">{localError || error}</div>}

      {files.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {files.map((file, idx) => (
            <div key={idx} className="position-relative border rounded-3 overflow-hidden" style={{ width: 96, height: 96 }}>
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                style={{ width: 22, height: 22, borderRadius: '0 0 0 8px' }}
                onClick={(e) => { e.stopPropagation(); removeAt(idx); }}
                aria-label={`Remove ${file.name}`}
              >
                <i className="bi bi-x" />
              </button>
              <span className="position-absolute bottom-0 start-0 end-0 text-white small px-1 text-truncate" style={{ background: 'rgba(0,0,0,0.55)', fontSize: '0.62rem' }}>
                {formatBytes(file.size)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
