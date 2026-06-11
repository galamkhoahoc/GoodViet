import { useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useState } from 'react';

export function Navbar() {
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllRead } = useNotificationStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  return (
    <header className="app-navbar">
      <div>
        <span style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-muted)' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-icon notification-badge"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge-count">{unreadCount}</span>
          )}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, width: '360px',
            background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline)',
            borderRadius: 'var(--md-sys-shape-corner-large)', boxShadow: 'var(--md-sys-elevation-3)',
            zIndex: 200, maxHeight: '400px', overflow: 'auto',
            animation: 'fadeInDown 0.2s ease', marginTop: '8px',
          }}>
            <div style={{
              padding: 'var(--md-sys-space-md) var(--md-sys-space-lg)',
              borderBottom: '1px solid var(--md-sys-color-outline)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 700 }}>Thông báo</span>
              {unreadCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                  <Check size={14} /> Đọc tất cả
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 'var(--md-sys-space-xl)', textAlign: 'center', color: 'var(--md-sys-color-on-surface-muted)' }}>
                Không có thông báo mới
              </div>
            ) : (
              notifications.slice(0, 8).map(n => (
                <div
                  key={n.id}
                  onClick={() => { markAsRead(n.id); }}
                  style={{
                    padding: 'var(--md-sys-space-md) var(--md-sys-space-lg)',
                    borderBottom: '1px solid var(--md-sys-color-outline)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'var(--md-sys-color-secondary-container)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (n.read) e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                  }}
                  onMouseLeave={(e) => {
                    if (n.read) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 'var(--md-sys-typescale-body-small-size)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 'var(--md-sys-typescale-label-small-size)', color: 'var(--md-sys-color-on-surface-muted)', marginTop: '4px' }}>
                    {n.message}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}
