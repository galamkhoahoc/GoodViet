import { Home, Mic2, MessageSquare, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { id: 'assessment', icon: Mic2, label: 'Đánh giá', path: '/assessment' },
    { id: 'practice', icon: BookOpen, label: 'Luyện tập', path: '/pathway' },
    { id: 'chat', icon: MessageSquare, label: 'Trò chuyện', path: '/chat' },
    { id: 'experts', icon: Settings, label: 'Cài đặt', path: '/profile' },
  ];

  const handleNavClick = (item: any) => {
    if (onTabChange) onTabChange(item.id);
    if (item.path) navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-24 h-full bg-white border-r border-gray-100 flex flex-col items-center py-6 shrink-0">
      
      {/* Logo */}
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8">
        <span className="text-white text-xl font-bold">G</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full flex flex-col items-center gap-2 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex flex-col items-center justify-center py-3 rounded-2xl transition-all group relative ${
                isActive 
                  ? 'bg-emerald-50' 
                  : 'hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-emerald-600' : 'bg-transparent'
              }`}>
                <Icon 
                  size={18} 
                  className={isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'} 
                  strokeWidth={2.5}
                />
              </div>
              <span className={`text-[11px] mt-1 font-medium ${
                isActive ? 'text-emerald-700' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-3 mt-auto pt-4 border-t border-gray-100 w-full px-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-2xl hover:bg-red-50 flex items-center justify-center transition-colors group"
          title="Đăng xuất"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-600" />
        </button>
      </div>
    </div>
  );
}
