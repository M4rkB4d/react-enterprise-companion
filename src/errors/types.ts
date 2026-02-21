import { type ReactNode } from 'react';

/**
 * Base error interface for all application errors
 */
export interface AppError {
  code: string;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Error severity levels for logging and monitoring
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;
export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Error categories for classification
 */
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system',
  UNKNOWN: 'unknown',
} as const;
export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

/**
 * API error structure from backend
 */
export interface ApiError extends AppError {
  statusCode: number;
  endpoint: string;
  method: string;
  requestId?: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

/**
 * Validation error for form handling
 */
export interface ValidationError extends AppError {
  field: string;
  validationType: string;
  constraints?: Record<string, string>;
}

/**
 * Error boundary fallback props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
}

/**
 * Error context state
 */
export interface ErrorState {
  errors: AppError[];
  lastError: AppError | null;
  hasUnhandledError: boolean;
}

/**
 * Error action types
 */
export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_UNHANDLED_ERROR'; payload: boolean };

/**
 * Error notification configuration
 */
export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryAction?: () => Promise<void>;
  fallbackComponent?: ReactNode;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Error logging payload
 */
export interface ErrorLogPayload {
  error: AppError;
  severity: ErrorSeverity;
  category: ErrorCategory;
  userContext?: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
  };
  appContext?: {
    route?: string;
    component?: string;
    action?: string;
  };
  stackTrace?: string;
}
