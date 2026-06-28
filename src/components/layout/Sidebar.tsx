import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, ClipboardCheck, Route, MessageCircle,
  Users, UserCircle, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/assessment', icon: ClipboardCheck, label: 'GOODVIET Check' },
  { to: '/pathway', icon: Route, label: 'Lộ trình luyện tập' },
  { to: '/chat', icon: MessageCircle, label: 'Chatbot đồng hành' },
  { to: '/experts', icon: Users, label: 'Kết nối chuyên gia' },
  { to: '/profile', icon: UserCircle, label: 'Hồ sơ cá nhân' },
];

export function Sidebar() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">G</div>
        <span className="sidebar-logo-text">GOODVIET</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Menu chính</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.fullName || 'Người dùng'}</div>
          <div className="sidebar-user-email">{user?.email || ''}</div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={logout} title="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
