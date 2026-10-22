import React from 'react';
import { useToast } from '../../hooks/useToast';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span className="toast-icon" aria-hidden="true">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          {toast.type === 'error' && (
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Dismiss error">
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
