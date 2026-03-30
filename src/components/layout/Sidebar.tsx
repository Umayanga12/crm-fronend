import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Activity, LogOut, Users, Contact2 } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import Badge from '@/components/crm/Badge';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Contacts', to: '/contacts', icon: Contact2 },
  { label: 'Activity Log', to: '/activity-logs', icon: Activity },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <span className="text-lg font-bold tracking-tight text-foreground">CRM</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'Admin' && (
          <NavLink
            to="/team"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Users className="h-4 w-4" />
            Team
          </NavLink>
        )}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
          <Badge label={user?.role ?? 'User'} variant="gray" />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
