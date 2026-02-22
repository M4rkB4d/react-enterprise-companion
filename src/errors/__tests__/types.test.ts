import { describe, it, expect } from 'vitest';
import { ErrorSeverity, ErrorCategory } from '../types';

describe('ErrorSeverity', () => {
  it('should have LOW, MEDIUM, HIGH, CRITICAL values', () => {
    expect(ErrorSeverity.LOW).toBe('low');
    expect(ErrorSeverity.MEDIUM).toBe('medium');
    expect(ErrorSeverity.HIGH).toBe('high');
    expect(ErrorSeverity.CRITICAL).toBe('critical');
  });

  it('should have exactly 4 severity levels', () => {
    expect(Object.keys(ErrorSeverity)).toHaveLength(4);
  });
});

describe('ErrorCategory', () => {
  it('should have all expected category values', () => {
    expect(ErrorCategory.NETWORK).toBe('network');
    expect(ErrorCategory.VALIDATION).toBe('validation');
    expect(ErrorCategory.AUTHENTICATION).toBe('authentication');
    expect(ErrorCategory.AUTHORIZATION).toBe('authorization');
    expect(ErrorCategory.BUSINESS_LOGIC).toBe('business_logic');
    expect(ErrorCategory.SYSTEM).toBe('system');
    expect(ErrorCategory.UNKNOWN).toBe('unknown');
  });

  it('should have exactly 7 categories', () => {
    expect(Object.keys(ErrorCategory)).toHaveLength(7);
  });
});
