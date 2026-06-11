import { Menu, Plus, LayoutDashboard, ClipboardCheck, Dumbbell, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NavigationRailProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationRail({ activeTab = 'dashboard', onTabChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'assessment', icon: ClipboardCheck, label: 'Assessment', path: '/assessment' },
    { id: 'practice', icon: Dumbbell, label: 'Practice', path: '/pathway' },
    { id: 'experts', icon: Users, label: 'Experts', path: '/experts' },
  ];

  const handleNavClick = (item: any) => {
    if (onTabChange) onTabChange(item.id);
    if (item.path) navigate(item.path);
  };

  return (
    <div className="w-[96px] h-full bg-[#f2f5eb] flex flex-col items-center py-8 shrink-0 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] z-50">
      
      {/* Top Actions */}
      <div className="flex flex-col items-center gap-6">
        <button className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
          <Menu size={24} className="text-[#42493c]" />
        </button>
        <button 
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[#386a20] shadow-md text-white hover:bg-[#2d561a] transition-colors"
          onClick={() => navigate('/chat')}
          title="New Chat"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Main Links */}
      <div className="flex-1 w-full mt-8 flex flex-col items-center gap-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="w-[76px] flex flex-col items-center justify-center py-2 gap-1 rounded-2xl transition-all"
            >
              <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-[#d8e7cb]' : 'hover:bg-black/5'
              }`}>
                <Icon size={20} className={isActive ? 'text-[#191d17]' : 'text-[#42493c]'} />
              </div>
              <span className={`text-xs ${isActive ? 'text-[#191d17] font-bold' : 'text-[#42493c] font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile */}
      <div className="mt-auto flex flex-col items-center">
        <button 
          onClick={() => {
            if (onTabChange) onTabChange('profile');
            navigate('/profile');
          }}
          className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-sm border-2 transition-colors ${activeTab === 'profile' ? 'border-[#386a20]' : 'border-transparent hover:border-[#c3c8bc]'}`}
        >
          {user?.avatar ? (
             <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-[#386a20] text-white flex items-center justify-center text-lg font-bold">
               {user?.name?.charAt(0).toUpperCase() || 'U'}
             </div>
          )}
        </button>
      </div>
    </div>
  );
}
