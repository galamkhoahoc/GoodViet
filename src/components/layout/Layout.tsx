import { Outlet, useLocation } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';
import { useEffect, useState } from 'react';

export function Layout() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync activeTab with current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/chat')) setActiveTab('chat');
    else if (path.includes('/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/profile')) setActiveTab('experts');
    else if (path.includes('/experts')) setActiveTab('experts');
    else if (path.includes('/pathway')) setActiveTab('practice');
    else if (path.includes('/assessment')) setActiveTab('assessment');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#ecefe5] p-4 gap-4 font-plus-jakarta">
      <NavigationRail activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex-1 overflow-y-auto relative rounded-[28px]">
        <Outlet />
      </main>
    </div>
  );
}
