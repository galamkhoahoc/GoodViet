import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);

  const handleNavClick = (path: string, id: string) => {
    if (onTabChange) onTabChange(id);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex flex-col h-screen fixed left-0 top-0 py-6 bg-surface-container-low w-nav-rail-width z-50 items-center border-r border-outline-variant/20">
      <div className="mb-10 cursor-pointer" onClick={() => handleNavClick('/dashboard', 'dashboard')}>
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6 w-full px-2">
        <button onClick={() => handleNavClick('/dashboard', 'dashboard')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'dashboard' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Trang chủ</span>
        </button>

        <button onClick={() => handleNavClick('/assessment', 'assessment')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'assessment' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'assessment' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'assessment' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Đánh giá</span>
        </button>

        <button onClick={() => handleNavClick('/pathway', 'pathway')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'pathway' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'pathway' ? "'FILL' 1" : "'FILL' 0" }}>auto_stories</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'pathway' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Lộ trình</span>
        </button>

        <button onClick={() => handleNavClick('/chat', 'chat')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'chat' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'chat' ? "'FILL' 1" : "'FILL' 0" }}>forum</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'chat' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Chatbot</span>
        </button>

        <button onClick={() => handleNavClick('/experts', 'experts')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'experts' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'experts' ? "'FILL' 1" : "'FILL' 0" }}>diversity_3</span>
          </div>
          <span className={`font-label-md text-[11px] min-w-max ${activeTab === 'experts' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Chuyên gia</span>
        </button>

        <button onClick={() => handleNavClick('/profile', 'profile')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'profile' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'profile' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Hồ sơ</span>
        </button>

        <button onClick={() => handleNavClick('/settings', 'settings')} className="flex flex-col items-center gap-1 group">
          <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'settings' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
          </div>
          <span className={`font-label-md text-[11px] ${activeTab === 'settings' ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Cài đặt</span>
        </button>
      </div>

      {/* Footer Section */}
      <div className="mt-auto mb-6 flex flex-col items-center gap-6 w-full">
        <button className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform group relative">
          <span className="material-symbols-outlined text-[24px]">group_add</span>
          <div className="absolute left-full ml-4 px-3 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Join Community</div>
        </button>
        <div className="flex flex-col items-center gap-6">
          <button className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors group relative">
             <span className="material-symbols-outlined text-[20px]">help_center</span>
             <div className="absolute left-full ml-4 px-3 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Hướng dẫn sử dụng</div>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-error transition-colors group relative">
             <span className="material-symbols-outlined text-[20px]">logout</span>
             <div className="absolute left-full ml-4 px-3 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Đăng xuất</div>
          </button>
        </div>
      </div>
    </nav>
  );
}

