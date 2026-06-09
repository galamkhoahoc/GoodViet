import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-area">
        <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
