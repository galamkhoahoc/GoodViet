import { Home, Compass, Edit3, MessageSquare, User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { id: 'pathway', icon: Compass, label: 'Lộ trình', path: '/pathway' },
    { id: 'assessment', icon: Edit3, label: 'Đánh giá', path: '/assessment' },
    { id: 'chat', icon: MessageSquare, label: 'Tin nhắn &\nChuyên gia', path: '/chat' },
    { id: 'profile', icon: User, label: 'Hồ sơ', path: '/profile' },
    { id: 'settings', icon: SettingsIcon, label: 'Cài đặt', path: '/settings' },
  ];

  const handleNavClick = (item: any) => {
    if (onTabChange) onTabChange(item.id);
    if (item.path) navigate(item.path);
  };

  return (
    <aside className="bg-white flex flex-col h-full items-center justify-between overflow-clip py-6 relative rounded-[28px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[96px] z-20">
      {/* Logo */}
      <div className="flex flex-col items-center pb-10">
        <div className="bg-[#386a20] flex items-center justify-center rounded-full w-12 h-12 shadow-sm cursor-pointer hover:bg-[#2c5319] transition-colors" onClick={() => navigate('/dashboard')}>
          <div className="w-5 h-5 bg-white/20 rounded-sm"></div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex flex-1 flex-col gap-6 items-center px-2 w-full">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="flex flex-col gap-1 items-center w-full group"
            >
              <div className={`flex items-center justify-center rounded-full w-14 h-8 transition-colors ${isActive ? 'bg-[#d8e7cb]' : 'group-hover:bg-[#f2f5eb]'}`}>
                <Icon size={isActive ? 18 : 20} className={isActive ? 'text-[#191d17]' : 'text-[#42493c]'} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] text-center whitespace-pre-line leading-[13.75px] ${isActive ? 'font-bold text-[#191d17]' : 'font-normal text-[#42493c]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Avatar / Community Button */}
      <div className="flex flex-col items-center w-full mt-4">
        <button className="bg-[#205107] flex items-center justify-center rounded-full w-12 h-12 shadow-sm hover:bg-[#1a4106] transition-colors relative group">
          <User size={20} className="text-white" />
        </button>
      </div>
    </aside>
  );
}
