import { type AppError, type ApiErrorDetail, ErrorCategory, ErrorSeverity } from './types';

/**
 * Base application error class
 */
export class ApplicationError extends Error implements AppError {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;

  constructor(
    message: string,
    code: string,
    options?: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: Record<string, unknown>;
      cause?: Error;
    },
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.timestamp = new Date();
    this.severity = options?.severity ?? ErrorSeverity.MEDIUM;
    this.category = options?.category ?? ErrorCategory.UNKNOWN;
    this.context = options?.context;

    if (options?.cause) {
      this.cause = options.cause;
    }

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Network/API error class
 */
export class NetworkError extends ApplicationError {
  public readonly statusCode: number;
  public readonly endpoint: string;
  public readonly method: string;
  public readonly requestId?: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    statusCode: number,
    options: {
      endpoint: string;
      method: string;
      requestId?: string;
      details?: ApiErrorDetail[];
      context?: Record<string, unknown>;
    },
  ) {
    super(message, `NETWORK_${statusCode}`, {
      severity: NetworkError.getSeverityFromStatus(statusCode),
      category: ErrorCategory.NETWORK,
      context: options.context,
    });
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.endpoint = options.endpoint;
    this.method = options.method;
    this.requestId = options.requestId;
    this.details = options.details;
  }

  private static getSeverityFromStatus(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.HIGH;
    if (status === 401 || status === 403) return ErrorSeverity.MEDIUM;
    if (status >= 400) return ErrorSeverity.LOW;
    return ErrorSeverity.MEDIUM;
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends ApplicationError {
  public readonly isExpired: boolean;
  public readonly requiresReauth: boolean;

  constructor(
    message: string,
    options?: {
      isExpired?: boolean;
      requiresReauth?: boolean;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, 'AUTH_ERROR', {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.AUTHENTICATION,
      context: options?.context,
    });
    this.name = 'AuthenticationError';
    this.isExpired = options?.isExpired ?? false;
    this.requiresReauth = options?.requiresReauth ?? true;
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends ApplicationError {
  public readonly requiredPermission?: string;
  public readonly userPermissions?: string[];

  constructor(
    message: string,
    options?: {
      requiredPermission?: string;
      userPermissions?: string[];
      context?: Record<string, unknown>;
    },
  ) {
    super(message, 'AUTHZ_ERROR', {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.AUTHORIZATION,
      context: options?.context,
    });
    this.name = 'AuthorizationError';
    this.requiredPermission = options?.requiredPermission;
    this.userPermissions = options?.userPermissions;
  }
}

/**
 * Validation error class
 */
export class FormValidationError extends ApplicationError {
  public readonly fieldErrors: Map<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]>,
    context?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', {
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.VALIDATION,
      context,
    });
    this.name = 'FormValidationError';
    this.fieldErrors = new Map(Object.entries(fieldErrors));
  }

  getFieldError(field: string): string[] {
    return this.fieldErrors.get(field) ?? [];
  }

  hasFieldError(field: string): boolean {
    return this.fieldErrors.has(field);
  }

  getAllErrors(): Record<string, string[]> {
    return Object.fromEntries(this.fieldErrors);
  }
}

/**
 * Business logic error class
 */
export class BusinessError extends ApplicationError {
  public readonly errorCode: string;
  public readonly userMessage: string;

  constructor(
    message: string,
    errorCode: string,
    userMessage: string,
    context?: Record<string, unknown>,
  ) {
    super(message, errorCode, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_LOGIC,
      context,
    });
    this.name = 'BusinessError';
    this.errorCode = errorCode;
    this.userMessage = userMessage;
  }
}

/**
 * System error class for unexpected errors
 */
export class SystemError extends ApplicationError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error, context?: Record<string, unknown>) {
    super(message, 'SYSTEM_ERROR', {
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.SYSTEM,
      context,
      cause: originalError,
    });
    this.name = 'SystemError';
    this.originalError = originalError;
  }
}
