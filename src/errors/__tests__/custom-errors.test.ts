import { describe, it, expect } from 'vitest';
import {
  ApplicationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  FormValidationError,
  BusinessError,
  SystemError,
} from '../custom-errors';
import { ErrorSeverity, ErrorCategory } from '../types';

describe('ApplicationError', () => {
  it('should create an error with required fields and correct defaults', () => {
    const error = new ApplicationError('Something went wrong', 'APP_001');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('APP_001');
    expect(error.name).toBe('ApplicationError');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.UNKNOWN);
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.context).toBeUndefined();
  });

  it('should accept optional severity, category, context, and cause', () => {
    const cause = new Error('root cause');
    const error = new ApplicationError('Custom error', 'APP_002', {
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.SYSTEM,
      context: { userId: '123' },
      cause,
    });

    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    expect(error.category).toBe(ErrorCategory.SYSTEM);
    expect(error.context).toEqual({ userId: '123' });
    expect(error.cause).toBe(cause);
  });

  it('should serialize to JSON correctly via toJSON()', () => {
    const error = new ApplicationError('Test', 'CODE_1', {
      context: { key: 'value' },
    });
    const json = error.toJSON();

    expect(json.code).toBe('CODE_1');
    expect(json.message).toBe('Test');
    expect(json.timestamp).toBeInstanceOf(Date);
    expect(json.context).toEqual({ key: 'value' });
  });
});

describe('NetworkError', () => {
  it('should create a network error with status code and endpoint info', () => {
    const error = new NetworkError('Not Found', 404, {
      endpoint: '/api/users',
      method: 'GET',
    });

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.name).toBe('NetworkError');
    expect(error.statusCode).toBe(404);
    expect(error.endpoint).toBe('/api/users');
    expect(error.method).toBe('GET');
    expect(error.code).toBe('NETWORK_404');
    expect(error.category).toBe(ErrorCategory.NETWORK);
  });

  it('should set HIGH severity for 5xx status codes', () => {
    const error = new NetworkError('Server Error', 500, {
      endpoint: '/api/data',
      method: 'POST',
    });
    expect(error.severity).toBe(ErrorSeverity.HIGH);
  });

  it('should set MEDIUM severity for 401 and 403 status codes', () => {
    const err401 = new NetworkError('Unauthorized', 401, {
      endpoint: '/api/secret',
      method: 'GET',
    });
    const err403 = new NetworkError('Forbidden', 403, {
      endpoint: '/api/admin',
      method: 'GET',
    });
    expect(err401.severity).toBe(ErrorSeverity.MEDIUM);
    expect(err403.severity).toBe(ErrorSeverity.MEDIUM);
  });

  it('should set LOW severity for other 4xx status codes', () => {
    const error = new NetworkError('Bad Request', 400, {
      endpoint: '/api/submit',
      method: 'POST',
    });
    expect(error.severity).toBe(ErrorSeverity.LOW);
  });

  it('should correctly identify client errors, server errors, and auth errors', () => {
    const clientErr = new NetworkError('Not Found', 404, {
      endpoint: '/api/x',
      method: 'GET',
    });
    const serverErr = new NetworkError('Internal', 502, {
      endpoint: '/api/x',
      method: 'GET',
    });
    const authErr = new NetworkError('Unauthorized', 401, {
      endpoint: '/api/x',
      method: 'GET',
    });

    expect(clientErr.isClientError()).toBe(true);
    expect(clientErr.isServerError()).toBe(false);
    expect(clientErr.isAuthError()).toBe(false);

    expect(serverErr.isServerError()).toBe(true);
    expect(serverErr.isClientError()).toBe(false);

    expect(authErr.isAuthError()).toBe(true);
    expect(authErr.isClientError()).toBe(true);
  });

  it('should store optional requestId and details', () => {
    const error = new NetworkError('Error', 500, {
      endpoint: '/api',
      method: 'GET',
      requestId: 'req-abc-123',
      details: [{ code: 'FIELD_ERR', message: 'Invalid', field: 'name' }],
    });

    expect(error.requestId).toBe('req-abc-123');
    expect(error.details).toHaveLength(1);
    expect(error.details![0].field).toBe('name');
  });
});

describe('AuthenticationError', () => {
  it('should create with correct defaults', () => {
    const error = new AuthenticationError('Session expired');

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe('AuthenticationError');
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(error.isExpired).toBe(false);
    expect(error.requiresReauth).toBe(true);
  });

  it('should accept isExpired and requiresReauth options', () => {
    const error = new AuthenticationError('Token expired', {
      isExpired: true,
      requiresReauth: false,
    });

    expect(error.isExpired).toBe(true);
    expect(error.requiresReauth).toBe(false);
  });
});

describe('AuthorizationError', () => {
  it('should create with correct defaults', () => {
    const error = new AuthorizationError('Access denied');

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe('AuthorizationError');
    expect(error.code).toBe('AUTHZ_ERROR');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
    expect(error.requiredPermission).toBeUndefined();
    expect(error.userPermissions).toBeUndefined();
  });

  it('should store permission details', () => {
    const error = new AuthorizationError('No admin access', {
      requiredPermission: 'admin:write',
      userPermissions: ['user:read', 'user:write'],
    });

    expect(error.requiredPermission).toBe('admin:write');
    expect(error.userPermissions).toEqual(['user:read', 'user:write']);
  });
});

describe('FormValidationError', () => {
  it('should create with field errors as a Map', () => {
    const error = new FormValidationError('Validation failed', {
      email: ['Email is required'],
      password: ['Too short', 'Must contain a number'],
    });

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe('FormValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.fieldErrors).toBeInstanceOf(Map);
  });

  it('should retrieve field errors with getFieldError()', () => {
    const error = new FormValidationError('Validation failed', {
      email: ['Email is required'],
    });

    expect(error.getFieldError('email')).toEqual(['Email is required']);
    expect(error.getFieldError('nonexistent')).toEqual([]);
  });

  it('should check field existence with hasFieldError()', () => {
    const error = new FormValidationError('Validation failed', {
      name: ['Required'],
    });

    expect(error.hasFieldError('name')).toBe(true);
    expect(error.hasFieldError('email')).toBe(false);
  });

  it('should return all errors as a Record via getAllErrors()', () => {
    const fieldErrors = {
      email: ['Invalid format'],
      password: ['Too short'],
    };
    const error = new FormValidationError('Validation failed', fieldErrors);

    expect(error.getAllErrors()).toEqual(fieldErrors);
  });
});

describe('BusinessError', () => {
  it('should create with errorCode and userMessage', () => {
    const error = new BusinessError(
      'Insufficient funds internal',
      'INSUFFICIENT_FUNDS',
      'You do not have enough balance to complete this transaction.',
    );

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe('BusinessError');
    expect(error.code).toBe('INSUFFICIENT_FUNDS');
    expect(error.errorCode).toBe('INSUFFICIENT_FUNDS');
    expect(error.userMessage).toBe('You do not have enough balance to complete this transaction.');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
  });

  it('should accept optional context', () => {
    const error = new BusinessError('Limit exceeded', 'LIMIT', 'Too many requests', {
      limit: 100,
    });

    expect(error.context).toEqual({ limit: 100 });
  });
});

describe('SystemError', () => {
  it('should create with CRITICAL severity and SYSTEM category', () => {
    const error = new SystemError('Unexpected failure');

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe('SystemError');
    expect(error.code).toBe('SYSTEM_ERROR');
    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    expect(error.category).toBe(ErrorCategory.SYSTEM);
    expect(error.originalError).toBeUndefined();
  });

  it('should wrap an original error and set it as cause', () => {
    const original = new TypeError('Cannot read properties of undefined');
    const error = new SystemError('System crash', original, { component: 'Dashboard' });

    expect(error.originalError).toBe(original);
    expect(error.cause).toBe(original);
    expect(error.context).toEqual({ component: 'Dashboard' });
  });
});
