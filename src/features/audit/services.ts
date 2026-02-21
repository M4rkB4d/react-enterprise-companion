import { apiClient } from '@/api/client';
import type { AuditEventListResponse } from './types';

interface AuditFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  severity?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const auditService = {
  async getEvents(filters: AuditFilters = {}): Promise<AuditEventListResponse> {
    const response = await apiClient.get('/audit/events', { params: filters });
    return response.data as AuditEventListResponse;
  },
} as const;
