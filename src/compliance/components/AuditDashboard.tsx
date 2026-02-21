// src/compliance/components/AuditDashboard.tsx

/**
 * AUDIT LOG VIEWER / DASHBOARD
 *
 * Searchable, filterable audit log for compliance officers.
 * Displays audit events with correlation ID linking,
 * date filtering, and action type filtering.
 *
 * Cross-ref: Doc 08 §5 for TanStack Query patterns
 * Cross-ref: Doc 03 §7 for data table patterns
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AuditLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly userId: string;
  readonly action: string;
  readonly resource: string;
  readonly metadata: Record<string, unknown>;
  readonly correlationId: string;
}

interface AuditFilters {
  search: string;
  actionType: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
}

export function AuditDashboard() {
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    actionType: '',
    dateFrom: '',
    dateTo: '',
    userId: '',
  });

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-events', filters, page],
    queryFn: async (): Promise<{
      events: AuditLogEntry[];
      total: number;
    }> => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(filters.search && { search: filters.search }),
        ...(filters.actionType && { action: filters.actionType }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.userId && { userId: filters.userId }),
      });

      const response = await fetch(`/api/v1/audit/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit events');
      return response.json();
    },
    staleTime: 30_000,
  });

  /** Unique action types for the filter dropdown */
  const actionTypes = useMemo(() => {
    if (!data?.events) return [];
    const types = new Set(data.events.map((e) => e.action));
    return Array.from(types).sort();
  }, [data?.events]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Audit Trail</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={filters.actionType}
          onChange={(e) => setFilters((f) => ({ ...f, actionType: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-center text-slate-500">Loading audit events...</p>
      ) : error ? (
        <p className="text-center text-red-600">Failed to load audit events.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Correlation ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {event.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{event.resource}</td>
                    <td className="px-4 py-3 text-xs">{event.userId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {event.correlationId.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
