import { useEffect, useState, useCallback } from 'react';
import { activityService } from '@/services/activityService';
import DataTable from '@/components/crm/DataTable';
import Pagination from '@/components/crm/Pagination';
import Badge from '@/components/crm/Badge';
import EmptyState from '@/components/crm/EmptyState';

interface LogEntry {
  id: number;
  user: string;
  action: string;
  model: string;
  object_id: string | number;
  timestamp: string;
  [key: string]: unknown;
}

const actionVariant = (action: string) => {
  const a = action.toUpperCase();
  if (a === 'CREATE') return 'success';
  if (a === 'UPDATE') return 'info';
  if (a === 'DELETE') return 'danger';
  return 'gray' as const;
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivityLogs({ page });
      setLogs(data.results ?? []);
      setTotalPages(Math.ceil((data.count ?? 0) / 10) || 1);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: 'user', label: 'User' },
    {
      key: 'action',
      label: 'Action',
      render: (r: LogEntry) => <Badge label={r.action} variant={actionVariant(r.action)} />,
    },
    { key: 'model', label: 'Model' },
    { key: 'object_id', label: 'Object ID' },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (r: LogEntry) => {
        const ts = r.timestamp || (r as Record<string, unknown>).created_at;
        if (!ts) return '';
        return new Date(ts as string).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        });
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">All actions performed within your organization</p>
      </div>

      {!loading && logs.length === 0 ? (
        <EmptyState title="No activity yet" description="Actions will appear here as they happen." />
      ) : (
        <>
          <DataTable columns={columns} data={logs} loading={loading} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
