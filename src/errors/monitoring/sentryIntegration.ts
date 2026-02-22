import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router';
import type { ErrorSeverity } from '../types';

interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialize Sentry error monitoring
 */
export function initializeSentry(config: Partial<SentryConfig> = {}): void {
  const dsn = config.dsn ?? import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not provided. Error monitoring is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: config.environment ?? import.meta.env.MODE,
    release: config.release ?? import.meta.env.VITE_APP_VERSION ?? '1.0.0',

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate ?? 0.1,

    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,

    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
    ],

    // Filter out noisy errors
    beforeSend(event) {
      // Ignore ResizeObserver errors (browser noise)
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }

      // Ignore cancelled requests
      if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
        return null;
      }

      return event;
    },
  });
}

/**
 * Set Sentry user context for error attribution
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser(user);
}

/**
 * Clear Sentry user context (on logout)
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Map app severity to Sentry severity level
 */
function mapSeverity(severity: ErrorSeverity): Sentry.SeverityLevel {
  const mapping: Record<string, Sentry.SeverityLevel> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'fatal',
  };
  return mapping[severity] ?? 'error';
}

/**
 * Report error to Sentry with additional context
 */
export function reportToSentry(
  error: Error,
  context?: {
    severity?: ErrorSeverity;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): void {
  Sentry.withScope((scope) => {
    if (context?.severity) {
      scope.setLevel(mapSeverity(context.severity));
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureException(error);
  });
}

/**
 * Add breadcrumb for navigation tracking
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, string>,
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}
