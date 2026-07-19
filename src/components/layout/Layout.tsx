import { Outlet, useLocation } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';

export function Layout() {
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased w-full">
      <NavigationRail activeTab={activeTab} />
      <Outlet />
    </div>
  );
}
