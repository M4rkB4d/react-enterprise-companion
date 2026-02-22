import { describe, it, expect } from 'vitest';
import { parseApiError } from '../parsers/apiErrorParser';
import { NetworkError, FormValidationError, BusinessError } from '../custom-errors';
import { ErrorCategory, ErrorSeverity } from '../types';

describe('parseApiError', () => {
  it('should parse a 422 response with validation errors into FormValidationError', () => {
    const response = {
      message: 'Validation failed',
      errors: [
        { field: 'email', code: 'INVALID', message: 'Email is not valid' },
        { field: 'email', code: 'REQUIRED', message: 'Email is required' },
        { field: 'name', code: 'REQUIRED', message: 'Name is required' },
      ],
    };

    const error = parseApiError(response, 422, '/api/users', 'POST');

    expect(error).toBeInstanceOf(FormValidationError);
    const validationError = error as FormValidationError;
    expect(validationError.message).toBe('Validation failed');
    expect(validationError.category).toBe(ErrorCategory.VALIDATION);
    expect(validationError.severity).toBe(ErrorSeverity.LOW);
    expect(validationError.getFieldError('email')).toEqual([
      'Email is not valid',
      'Email is required',
    ]);
    expect(validationError.getFieldError('name')).toEqual(['Name is required']);
    expect(validationError.context).toEqual({ endpoint: '/api/users', method: 'POST' });
  });

  it('should use default message when 422 response has no message', () => {
    const response = {
      errors: [{ field: 'age', code: 'MIN', message: 'Must be at least 18' }],
    };

    const error = parseApiError(response, 422, '/api/signup', 'POST');

    expect(error).toBeInstanceOf(FormValidationError);
    expect(error.message).toBe('Validation failed');
  });

  it('should parse a 400 response with errorCode and userMessage into BusinessError', () => {
    const response = {
      message: 'Internal: insufficient funds',
      errorCode: 'INSUFFICIENT_FUNDS',
      userMessage: 'You do not have enough balance.',
      statusCode: 400,
    };

    const error = parseApiError(response, 400, '/api/transfer', 'POST');

    expect(error).toBeInstanceOf(BusinessError);
    const businessError = error as BusinessError;
    expect(businessError.errorCode).toBe('INSUFFICIENT_FUNDS');
    expect(businessError.userMessage).toBe('You do not have enough balance.');
    expect(businessError.category).toBe(ErrorCategory.BUSINESS_LOGIC);
    expect(businessError.context).toEqual({ endpoint: '/api/transfer', method: 'POST' });
  });

  it('should fall back to NetworkError for a generic error response', () => {
    const response = {
      message: 'Internal Server Error',
      requestId: 'req-xyz-789',
    };

    const error = parseApiError(response, 500, '/api/data', 'GET');

    expect(error).toBeInstanceOf(NetworkError);
    const networkError = error as NetworkError;
    expect(networkError.statusCode).toBe(500);
    expect(networkError.message).toBe('Internal Server Error');
    expect(networkError.endpoint).toBe('/api/data');
    expect(networkError.method).toBe('GET');
    expect(networkError.requestId).toBe('req-xyz-789');
  });

  it('should handle null/undefined response gracefully and produce NetworkError', () => {
    const error = parseApiError(null, 500, '/api/unknown', 'GET');

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.message).toBe('Request failed with status 500');
  });

  it('should produce NetworkError for a 400 response without errorCode (not a business error)', () => {
    const response = {
      message: 'Bad request format',
      statusCode: 400,
    };

    const error = parseApiError(response, 400, '/api/submit', 'POST');

    expect(error).toBeInstanceOf(NetworkError);
    const networkError = error as NetworkError;
    expect(networkError.statusCode).toBe(400);
    expect(networkError.message).toBe('Bad request format');
  });

  it('should produce NetworkError for 422 without proper validation error shape', () => {
    const response = {
      message: 'Something went wrong',
      errors: [{ reason: 'no field or message key' }],
    };

    const error = parseApiError(response, 422, '/api/items', 'PUT');

    // errors array items do not have 'field' and 'message', so isValidationError is false
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('should include details from the response in the NetworkError fallback', () => {
    const response = {
      message: 'Rate limited',
      errors: [{ field: 'rate', code: 'RATE_LIMIT', message: 'Too many requests' }],
      requestId: 'req-rate-001',
    };

    const error = parseApiError(response, 429, '/api/actions', 'POST');

    expect(error).toBeInstanceOf(NetworkError);
    const networkError = error as NetworkError;
    expect(networkError.requestId).toBe('req-rate-001');
    expect(networkError.details).toHaveLength(1);
  });
});
