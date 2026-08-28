import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-portal-container" id="toast-portal-root" aria-live="polite" role="region">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, type = 'error', title, message, duration = 5000 } = toast;
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const interval = 50; // update every 50ms for smooth progress bar
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration, isPaused]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 280);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-emerald-400" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon text-amber-400" />;
      case 'info':
        return <Info size={18} className="toast-icon text-indigo-400" />;
      case 'error':
      default:
        return <AlertCircle size={18} className="toast-icon text-rose-400" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Erfolgreich';
      case 'warning':
        return 'Hinweis';
      case 'info':
        return 'Information';
      case 'error':
      default:
        return 'Fehler';
    }
  };

  return (
    <div
      className={`toast-card toast-${type} ${isExiting ? 'toast-card-exiting' : 'toast-card-entering'}`}
      id={`toast-item-${id}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      <div className="toast-header-row">
        <div className="toast-title-group">
          {getIcon()}
          <span className="toast-title-text">{getTitle()}</span>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={handleClose}
          aria-label="Schließen"
          title="Meldung schließen"
        >
          <X size={15} />
        </button>
      </div>

      {message && <p className="toast-message-body">{message}</p>}

      {duration > 0 && (
        <div className="toast-progress-track">
          <div
            className={`toast-progress-bar toast-progress-${type}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
