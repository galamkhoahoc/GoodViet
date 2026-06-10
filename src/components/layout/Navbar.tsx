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
        <span style={{ fontSize: 'var(--gv-font-size-sm)', color: 'var(--gv-text-muted)' }}>
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
            background: 'var(--gv-bg-surface)', border: '1px solid var(--gv-border)',
            borderRadius: 'var(--gv-radius-lg)', boxShadow: 'var(--gv-shadow-lg)',
            zIndex: 200, maxHeight: '400px', overflow: 'auto',
            animation: 'fadeInDown 0.2s ease', marginTop: '8px',
          }}>
            <div style={{
              padding: 'var(--gv-space-md) var(--gv-space-lg)',
              borderBottom: '1px solid var(--gv-border)',
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
              <div style={{ padding: 'var(--gv-space-xl)', textAlign: 'center', color: 'var(--gv-text-muted)' }}>
                Không có thông báo mới
              </div>
            ) : (
              notifications.slice(0, 8).map(n => (
                <div
                  key={n.id}
                  onClick={() => { markAsRead(n.id); }}
                  style={{
                    padding: 'var(--gv-space-md) var(--gv-space-lg)',
                    borderBottom: '1px solid var(--gv-border)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'var(--gv-primary-soft)',
                    transition: 'background var(--gv-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (n.read) e.currentTarget.style.background = 'var(--gv-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (n.read) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 'var(--gv-font-size-sm)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 'var(--gv-font-size-xs)', color: 'var(--gv-text-muted)', marginTop: '4px' }}>
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
