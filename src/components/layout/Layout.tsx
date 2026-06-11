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
    else if (path.includes('/dashboard')) setActiveTab('stats');
    else if (path.includes('/profile')) setActiveTab('info');
    else if (path.includes('/experts')) setActiveTab('experts');
    else if (path.includes('/pathway')) setActiveTab('pathway');
    else if (path.includes('/assessment')) setActiveTab('assessment');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  return (
    <div className="app-container">
      <NavigationRail activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="chat-main">
        <div className="chat-content-card" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
