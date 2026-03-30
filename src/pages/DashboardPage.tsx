import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Activity } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { companyService } from '@/services/companyService';
import { activityService } from '@/services/activityService';
import DataTable from '@/components/crm/DataTable';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | null;
  onClick: () => void;
}

function StatCard({ icon: Icon, label, value, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 text-left transition-colors hover:bg-secondary/30 w-full"
    >
      <div className="rounded-lg bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {value === null ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        )}
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [activityCount, setActivityCount] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, activities] = await Promise.all([
          companyService.getCompanies({ page: 1 }),
          activityService.getActivityLogs({ page: 1 }),
        ]);
        setCompanyCount(companies.count ?? companies.results?.length ?? 0);
        setContactCount(companies.contact_count ?? 0);
        setActivityCount(activities.count ?? activities.results?.length ?? 0);
        setRecentLogs((activities.results ?? []).slice(0, 5));
      } catch {
        // errors handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const logColumns = [
    { 
      key: 'user', 
      label: 'User', 
      render: (r: Record<string, unknown>) => {
        const u = r.user as { first_name?: string; last_name?: string; email: string; } | null;
        if (!u) return 'System';
        if (u.first_name || u.last_name) {
          return `${u.first_name || ''} ${u.last_name || ''}`.trim();
        }
        return u.email;
      }
    },
    { key: 'action', label: 'Action' },
    { key: 'model_name', label: 'Model' },
    { key: 'object_id', label: 'Object ID' },
    {
      key: 'timestamp',
      label: 'Time',
      render: (r: Record<string, unknown>) => {
        const ts = r.timestamp || r.created_at;
        return ts ? new Date(ts as string).toLocaleString() : '';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        Welcome, {user?.email}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Total Companies" value={companyCount} onClick={() => navigate('/companies')} />
        <StatCard icon={Users} label="Total Contacts" value={contactCount} onClick={() => navigate('/companies')} />
        <StatCard icon={Activity} label="Recent Activity" value={activityCount} onClick={() => navigate('/activity-logs')} />
      </div>

      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Recent Activity</h3>
        <DataTable columns={logColumns} data={recentLogs} loading={loading} />
      </div>
    </div>
  );
}
