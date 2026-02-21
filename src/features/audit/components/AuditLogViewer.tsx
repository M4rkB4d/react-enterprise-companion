import { useState } from 'react';
import { useAuditEvents } from '../hooks/useAuditEvents';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { Search, AlertCircle } from 'lucide-react';
import type { AuditSeverity } from '../types';

const severityStyles: Record<AuditSeverity, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
};

const actionLabels: Record<string, string> = {
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.login_failed': 'Login Failed',
  'account.viewed': 'Account Viewed',
  'payment.created': 'Payment Created',
  'payment.cancelled': 'Payment Cancelled',
  'transfer.created': 'Transfer Created',
  'transfer.failed': 'Transfer Failed',
  'payee.created': 'Payee Added',
  'payee.deleted': 'Payee Removed',
  'settings.updated': 'Settings Updated',
  'profile.updated': 'Profile Updated',
};

export function AuditLogViewer() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error } = useAuditEvents({
    page,
    pageSize: 20,
    action: actionFilter || undefined,
    severity: severityFilter || undefined,
    search: searchQuery || undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All Actions</option>
          {Object.entries(actionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      {isLoading && !data ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">Failed to load audit events: {error.message}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data?.data.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{event.userName}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {actionLabels[event.action] ?? event.action}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          severityStyles[event.severity],
                        )}
                      >
                        {event.severity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {event.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatMetadata(event.metadata)}
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No audit events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {data.page} of {data.totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata);
  if (entries.length === 0) return '-';
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
}
