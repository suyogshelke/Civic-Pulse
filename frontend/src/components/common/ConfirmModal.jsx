import Modal from './Modal';

/** Confirmation dialog for destructive or irreversible actions. */
export default function ConfirmModal({
  open, title = 'Are you sure?', message, confirmLabel = 'Confirm',
  cancelLabel = 'Cancel', variant = 'primary', busy = false, onConfirm, onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button className="btn btn-light" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="mb-0 text-secondary">{message}</p>
    </Modal>
  );
}
