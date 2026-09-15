import { useState } from 'react';
import Modal from '../common/Modal';
import { formatBytes } from '../../utils/formatters';

/**
 * Thumbnail grid for complaint evidence. Seed data has no dataUrl (only
 * metadata), so those render as a placeholder tile; real uploads carry a
 * dataUrl and open in a lightbox.
 */
export default function AttachmentGallery({ attachments = [], emptyHint = 'No photos were attached.' }) {
  const [preview, setPreview] = useState(null);
  if (!attachments.length) return <p className="text-muted small mb-0">{emptyHint}</p>;

  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        {attachments.map((att) => (
          <button
            key={att.id}
            type="button"
            className="border rounded-3 overflow-hidden p-0 bg-light position-relative"
            style={{ width: 104, height: 104 }}
            onClick={() => att.dataUrl && setPreview(att)}
            title={att.name}
          >
            {att.dataUrl ? (
              <img src={att.dataUrl} alt={att.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
            ) : (
              <span className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <i className="bi bi-image fs-3" />
                <small style={{ fontSize: '0.6rem' }}>{formatBytes(att.size)}</small>
              </span>
            )}
            {att.resolution && (
              <span className="badge text-bg-success position-absolute top-0 start-0" style={{ fontSize: '0.55rem', borderRadius: '0 0 8px 0' }}>
                Resolution
              </span>
            )}
          </button>
        ))}
      </div>
      <Modal open={Boolean(preview)} title={preview?.name} onClose={() => setPreview(null)} size="modal-lg">
        {preview?.dataUrl && <img src={preview.dataUrl} alt={preview.name} className="w-100 rounded" />}
      </Modal>
    </>
  );
}
