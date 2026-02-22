import { NetworkError, FormValidationError, BusinessError } from '../custom-errors';
import type { ApiErrorDetail } from '../types';

interface StandardApiError {
  message: string;
  code?: string;
  statusCode: number;
  errors?: ApiErrorDetail[];
  requestId?: string;
}

interface ValidationApiError extends StandardApiError {
  errors: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

interface BusinessApiError extends StandardApiError {
  errorCode: string;
  userMessage: string;
}

/**
 * Parse API error response into appropriate error type
 */
export function parseApiError(
  response: unknown,
  statusCode: number,
  endpoint: string,
  method: string,
): NetworkError | FormValidationError | BusinessError {
  const errorData = response as StandardApiError;

  // Handle validation errors (422)
  if (statusCode === 422 && isValidationError(errorData)) {
    const fieldErrors: Record<string, string[]> = {};

    for (const error of errorData.errors) {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error.message);
    }

    return new FormValidationError(errorData.message || 'Validation failed', fieldErrors, {
      endpoint,
      method,
    });
  }

  // Handle business logic errors (400 with errorCode)
  if (statusCode === 400 && isBusinessError(errorData)) {
    return new BusinessError(errorData.message, errorData.errorCode, errorData.userMessage, {
      endpoint,
      method,
    });
  }

  // Default to NetworkError
  return new NetworkError(
    errorData?.message ?? `Request failed with status ${statusCode}`,
    statusCode,
    {
      endpoint,
      method,
      requestId: errorData?.requestId,
      details: errorData?.errors,
    },
  );
}

function isValidationError(error: unknown): error is ValidationApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ValidationApiError).errors) &&
    (error as ValidationApiError).errors.every((e) => 'field' in e && 'message' in e)
  );
}

function isBusinessError(error: unknown): error is BusinessApiError {
  return (
    typeof error === 'object' && error !== null && 'errorCode' in error && 'userMessage' in error
  );
}
