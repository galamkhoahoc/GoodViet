import { Home, Mic2, Users, BookOpen, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'assessment', icon: Mic2, label: 'Assessment', path: '/assessment' },
    { id: 'practice', icon: BookOpen, label: 'Practice', path: '/pathway' },
    { id: 'experts', icon: Users, label: 'Experts', path: '/experts' },
  ];

  const handleNavClick = (item: any) => {
    if (onTabChange) onTabChange(item.id);
    if (item.path) navigate(item.path);
  };

  return (
    <div className="w-[280px] h-full bg-white rounded-[28px] shadow-sm flex flex-col py-6 shrink-0">
      {/* Logo Section */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[17px] h-[17px] bg-[#205107] rounded-sm"></div>
          <h1 className="text-[28px] font-bold text-[#205107] leading-9">GoodViet</h1>
        </div>
        <p className="text-[12px] font-medium text-[#42493c] tracking-[0.5px] leading-4">
          Celebrate Vietnamese Excellence
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-full transition-all ${
                isActive 
                  ? 'bg-[#d8e7cb]' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={18} 
                className={isActive ? 'text-[#596750]' : 'text-[#42493c]'} 
                strokeWidth={2}
              />
              <span className={`text-[14px] font-medium tracking-[0.1px] leading-5 ${
                isActive ? 'text-[#596750]' : 'text-[#42493c]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Settings at bottom of nav */}
        <div className="flex-1 flex flex-col justify-end min-h-[48px] pt-[488px]">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-4 px-5 py-3 rounded-full hover:bg-gray-50 transition-all"
          >
            <Settings size={20} className="text-[#42493c]" strokeWidth={2} />
            <span className="text-[14px] font-medium tracking-[0.1px] leading-5 text-[#42493c]">
              Settings
            </span>
          </button>
        </div>
      </nav>

      {/* Join Community Button */}
      <div className="px-5 pt-6 pb-2">
        <button className="w-full bg-[#205107] text-white py-3 rounded-full text-[14px] font-medium tracking-[0.1px] leading-5 hover:bg-[#1a4106] transition-colors">
          Join Community
        </button>
      </div>
    </div>
  );
}
