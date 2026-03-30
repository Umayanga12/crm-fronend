import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)]">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
