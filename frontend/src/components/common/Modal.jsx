import { useEffect } from 'react';

/**
 * Accessible modal dialog rendered without Bootstrap's JS bundle.
 * Closes on backdrop click and the Escape key; locks body scroll while open.
 */
export default function Modal({ open, title, onClose, children, footer, size = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} role="dialog" aria-modal="true" onMouseDown={onClose}>
        <div className={`modal-dialog modal-dialog-centered ${size}`} onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-content" style={{ borderRadius: 'var(--cp-radius)', border: 'none', boxShadow: 'var(--cp-shadow-lg)' }}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
