import { useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import Badge from '@/components/crm/Badge';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/companies': 'Companies',
  '/activity-logs': 'Activity Log',
};

export default function Topbar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith('/companies/') ? 'Company Detail' : '');

  const plan = user?.organization?.subscription_plan;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        {user?.organization && (
          <span className="text-sm text-muted-foreground">{user.organization.name}</span>
        )}
        {plan && (
          <Badge
            label={plan}
            variant={plan === 'Pro' ? 'purple' : 'gray'}
          />
        )}
      </div>
    </header>
  );
}
