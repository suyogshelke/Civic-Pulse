/**
 * Lightweight toast notification system.
 *
 * Provides a `toast` object with success/error/info/warning helpers and
 * renders a fixed stack of Bootstrap toasts in the corner of the screen.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info', timeout = 4000) => {
      const id = (counter += 1);
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (timeout) setTimeout(() => remove(id), timeout);
      return id;
    },
    [remove],
  );

  const toast = useMemo(
    () => ({
      success: (m, t) => push(m, 'success', t),
      error: (m, t) => push(m, 'danger', t ?? 6000),
      info: (m, t) => push(m, 'info', t),
      warning: (m, t) => push(m, 'warning', t),
    }),
    [push],
  );

  const ICONS = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-octagon-fill',
    info: 'bi-info-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.variant} border-0 mb-2 shadow`} role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className={`bi ${ICONS[t.variant] || ICONS.info}`} />
                <span>{t.message}</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => remove(t.id)} aria-label="Close" />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
