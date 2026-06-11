import { MessageCircle, BarChart3, Info, Settings, Plus, Menu, ClipboardCheck, Route, Users2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const navItems = [
    { id: 'chat', icon: MessageCircle, label: 'Trò chuyện', path: '/chat' },
    { id: 'stats', icon: BarChart3, label: 'Trang chủ', path: '/dashboard' },
    { id: 'assessment', icon: ClipboardCheck, label: 'Đánh giá', path: '/assessment' },
    { id: 'pathway', icon: Route, label: 'Lộ trình', path: '/pathway' },
    { id: 'experts', icon: Users2, label: 'Chuyên gia', path: '/experts' },
    { id: 'info', icon: Info, label: 'Hồ sơ', path: '/profile' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    // Navigate using React Router
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className={`navigation-rail ${expanded ? 'expanded' : ''}`}>
      {/* Menu Button */}
      <button 
        className="rail-menu-btn" 
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Thu gọn menu' : 'Mở rộng menu'}
      >
        <Menu size={24} />
      </button>

      {/* FAB - New Chat */}
      <button className="rail-fab" onClick={() => handleNavClick(navItems[0])} title="Cuộc trò chuyện mới">
        <Plus size={24} />
        {expanded && <span className="rail-fab-label">Cuộc trò chuyện mới</span>}
      </button>

      {/* Rail Items */}
      <div className="rail-items">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              className={`rail-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              title={item.label}
            >
              <div className="rail-item-icon">
                <Icon size={24} />
              </div>
              <span className="rail-item-label">{item.label}</span>
              {/* Badge example for stats */}
              {item.id === 'stats' && (
                <span className="rail-badge" style={{ display: 'none' }}>0</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="profile-info">
          <div className="avatar-circle" title={user?.name || 'User'}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {expanded && (
            <div className="profile-details">
              <div className="profile-name">{user?.name || 'User'}</div>
              <div className="profile-email">{user?.email || 'user@example.com'}</div>
            </div>
          )}
        </div>
        {expanded && (
          <button 
            className="logout-btn" 
            onClick={logout}
            title="Đăng xuất"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}
