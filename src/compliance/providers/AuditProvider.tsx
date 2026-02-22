// src/compliance/providers/AuditProvider.tsx

/**
 * AUDIT PROVIDER
 *
 * React context that:
 * 1. Generates a correlation ID per session
 * 2. Automatically logs page views
 * 3. Provides the correlation ID to all child components
 * 4. Attaches the correlation ID to outgoing API requests
 *
 * Wrap your app in this provider to enable automatic auditing.
 *
 * Cross-ref: Doc 04 §6 for context provider patterns
 * Cross-ref: Doc 05 §3 for route change detection
 */

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

interface AuditContextValue {
  readonly correlationId: string;
  readonly sessionId: string;
}

const AuditContext = createContext<AuditContextValue | null>(null);

/**
 * Hook to get the current correlation ID.
 * Must be used inside AuditProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook export alongside provider
export function useCorrelationId(): string {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error('useCorrelationId must be used inside AuditProvider');
  }
  return ctx.correlationId;
}

/**
 * Hook to get the current session ID.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook export alongside provider
export function useSessionId(): string {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error('useSessionId must be used inside AuditProvider');
  }
  return ctx.sessionId;
}

interface AuditProviderProps {
  readonly children: ReactNode;
}

export function AuditProvider({ children }: AuditProviderProps) {
  const location = useLocation();

  // Generate a session-scoped correlation ID.
  // A new ID is generated per browser session (tab).
  const sessionId = useMemo(() => uuidv4(), []);
  const correlationId = useMemo(() => uuidv4(), []);

  // Track the previous path to avoid duplicate page view events
  const prevPathRef = useRef<string>('');

  /**
   * Automatically log page views on route changes.
   * This means every navigation in the SPA is audited
   * without requiring manual logEvent() calls.
   */
  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    // Fire-and-forget page view event
    fetch('/api/v1/audit/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({
        events: [
          {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: 'page.viewed',
            resource: `page:${location.pathname}`,
            metadata: {
              path: location.pathname,
              search: location.search,
            },
            correlationId,
          },
        ],
      }),
    }).catch(() => {
      // Page view logging failure should not break the app
    });
  }, [location.pathname, location.search, correlationId]);

  const value = useMemo(() => ({ correlationId, sessionId }), [correlationId, sessionId]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
