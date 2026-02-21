import { useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuditAction, AuditSeverity } from '../types';

interface LogEventOptions {
  action: AuditAction;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for logging user actions to the audit trail.
 * Returns a function that can be called to record an audit event.
 */
export function useAuditTrail() {
  const user = useAuthStore((s) => s.user);

  const logEvent = useCallback(
    async ({ action, severity = 'info', metadata = {} }: LogEventOptions) => {
      if (!user) return;

      try {
        await apiClient.post('/audit/events', {
          userId: user.id,
          userName: user.name,
          action,
          severity,
          metadata,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Audit logging should not block user actions
        console.error('[AuditTrail] Failed to log event:', error);
      }
    },
    [user],
  );

  return { logEvent };
}
