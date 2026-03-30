import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className={cn('border-b border-border transition-colors hover:bg-secondary/30', i === data.length - 1 && 'border-b-0')}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
