import { Outlet } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';
import { useState } from 'react';

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <NavigationRail activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="chat-main">
        <Outlet />
      </main>
    </div>
  );
}
