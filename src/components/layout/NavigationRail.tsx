import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookOpenCheck,
  CircleHelp,
  ClipboardCheck,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserRoundPlus,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', path: '/dashboard', icon: Home, label: 'Trang chủ' },
  { id: 'pathway', path: '/pathway', icon: BookOpen, label: 'Lộ trình' },
  { id: 'assessment', path: '/assessment', icon: ClipboardCheck, label: 'Đánh giá' },
  { id: 'chat', path: '/chat', icon: MessageSquare, label: 'Tin nhắn & Chuyên gia' },
  { id: 'profile', path: '/profile', icon: User, label: 'Hồ sơ' },
  { id: 'settings', path: '/settings', icon: Settings, label: 'Cài đặt' },
] as const;

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);

  const goTo = (path: string, id: string) => {
    onTabChange?.(id);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="gv-navigation" aria-label="Điều hướng chính">
      <button
        type="button"
        className="gv-navigation__brand"
        onClick={() => goTo('/dashboard', 'dashboard')}
        aria-label="Về trang chủ GoodViet"
      >
        <BookOpenCheck aria-hidden="true" />
      </button>

      <div className="gv-navigation__items">
        {navigationItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`gv-navigation__item${isActive ? ' is-active' : ''}`}
              onClick={() => goTo(item.path, item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <span className="gv-navigation__indicator">
                <Icon aria-hidden="true" />
              </span>
              <span className="gv-navigation__label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="gv-navigation__footer">
        <button
          type="button"
          className={`gv-navigation__community${activeTab === 'experts' ? ' is-active' : ''}`}
          onClick={() => goTo('/experts', 'experts')}
          aria-label="Kết nối chuyên gia"
          title="Kết nối chuyên gia"
        >
          <UserRoundPlus aria-hidden="true" />
        </button>

        <div className="gv-navigation__utility">
          <button className={activeTab === 'guide' ? 'is-active' : ''} type="button" onClick={() => goTo('/guide', 'guide')} aria-label="Hướng dẫn" title="Hướng dẫn">
            <CircleHelp aria-hidden="true" />
          </button>
          <button type="button" onClick={handleLogout} aria-label="Đăng xuất" title="Đăng xuất">
            <LogOut aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
