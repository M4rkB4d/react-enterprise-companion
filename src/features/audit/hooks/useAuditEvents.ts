import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditService } from '../services';

interface UseAuditEventsOptions {
  page?: number;
  pageSize?: number;
  action?: string;
  severity?: string;
  search?: string;
}

export const auditQueryKeys = {
  all: ['audit'] as const,
  events: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.all, 'events', filters] as const,
};

/** Fetch paginated audit events with filters */
export function useAuditEvents(options: UseAuditEventsOptions = {}) {
  const { page = 1, pageSize = 20, ...filters } = options;

  return useQuery({
    queryKey: auditQueryKeys.events({ page, pageSize, ...filters }),
    queryFn: () => auditService.getEvents({ page, pageSize, ...filters }),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}
