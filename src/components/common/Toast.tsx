import { create } from 'zustand';
import { useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

// --- Toast Store ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set(state => ({
      toasts: [...state.toasts, { ...toast, id, duration: toast.duration ?? 4000 }],
    }));
    return id;
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));

// --- Convenience functions ---
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration: 6000 }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
};

// --- Toast Item Component ---
function ToastItemView({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  useEffect(() => {
    if (item.duration && item.duration > 0) {
      const timer = setTimeout(onRemove, item.duration);
      return () => clearTimeout(timer);
    }
  }, [item.duration, onRemove]);

  const iconMap = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colorMap = {
    success: { bg: '#E8F5E9', border: '#4CAF50', icon: '#2E7D32' },
    error: { bg: '#FFEBEE', border: '#F44336', icon: '#C62828' },
    warning: { bg: '#FFF8E1', border: '#FF9800', icon: '#E65100' },
    info: { bg: '#E3F2FD', border: '#2196F3', icon: '#1565C0' },
  };

  const colors = colorMap[item.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        maxWidth: 380,
        width: '100%',
        animation: 'toast-slide-in 0.3s ease-out',
      }}
    >
      <div style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }}>
        {iconMap[item.type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#191A23' }}>{item.title}</div>
        {item.message && (
          <div style={{ fontSize: 13, color: '#6B6C7A', marginTop: 2, lineHeight: 1.5 }}>{item.message}</div>
        )}
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: '#6B6C7A',
          flexShrink: 0,
        }}
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// --- Toast Container (render once in App) ---
export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);
  const handleRemove = useCallback((id: string) => removeToast(id), [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.slice(0, 5).map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItemView item={t} onRemove={() => handleRemove(t.id)} />
        </div>
      ))}
    </div>
  );
}
