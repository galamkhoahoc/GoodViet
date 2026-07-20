import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', path: '/dashboard', icon: 'home', label: 'Trang chủ' },
  { id: 'pathway', path: '/pathway', icon: 'auto_stories', label: 'Lộ trình' },
  { id: 'assessment', path: '/assessment', icon: 'fact_check', label: 'Đánh giá' },
  { id: 'chat', path: '/chat', icon: 'forum', label: 'Tin nhắn & Chuyên gia' },
  { id: 'profile', path: '/profile', icon: 'person', label: 'Hồ sơ' },
  { id: 'settings', path: '/settings', icon: 'settings', label: 'Cài đặt' },
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
        <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
      </button>

      <div className="gv-navigation__items">
        {navigationItems.map(item => {
          const isActive = activeTab === item.id;

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
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              </span>
              <span className="gv-navigation__label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="gv-navigation__footer">
        <button
          type="button"
          className="gv-navigation__community"
          onClick={() => goTo('/experts', 'experts')}
          aria-label="Kết nối chuyên gia"
          title="Kết nối chuyên gia"
        >
          <span className="material-symbols-outlined" aria-hidden="true">group_add</span>
        </button>

        <div className="gv-navigation__utility">
          <button type="button" onClick={() => goTo('/guide', 'guide')} aria-label="Hướng dẫn" title="Hướng dẫn">
            <span className="material-symbols-outlined" aria-hidden="true">help</span>
          </button>
          <button type="button" onClick={handleLogout} aria-label="Đăng xuất" title="Đăng xuất">
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
