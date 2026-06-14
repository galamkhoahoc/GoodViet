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
    else if (path.includes('/profile')) setActiveTab('profile');
    else if (path.includes('/experts')) setActiveTab('experts');
    else if (path.includes('/pathway')) setActiveTab('pathway');
    else if (path.includes('/assessment')) setActiveTab('assessment');
    else if (path.includes('/settings')) setActiveTab('settings');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased w-full">
      <NavigationRail activeTab={activeTab} onTabChange={setActiveTab} />
      <Outlet />
    </div>
  );
}
