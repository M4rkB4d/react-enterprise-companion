import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskPhone,
  maskAccountNumber,
  maskSSN,
  maskName,
  maskGeneric,
} from '../utils/data-masking';

const MASK = '\u2022';

describe('maskEmail', () => {
  it('masks the local part keeping first 2 chars', () => {
    const result = maskEmail('johndoe@example.com');
    expect(result).toBe(`jo${MASK.repeat(5)}@example.com`);
  });

  it('handles short local part (1 char)', () => {
    const result = maskEmail('j@example.com');
    expect(result).toBe(`j${MASK.repeat(2)}@example.com`);
  });

  it('returns fully masked fallback for input without @', () => {
    const result = maskEmail('invalidemail');
    expect(result).toBe(`${MASK}${MASK}@${MASK}${MASK}`);
  });
});

describe('maskPhone', () => {
  it('shows last 4 digits of a standard phone number', () => {
    const result = maskPhone('+1 (555) 123-4567');
    expect(result).toBe(`${MASK}${MASK}${MASK}-${MASK}${MASK}${MASK}-4567`);
  });

  it('returns full mask for phone with fewer than 4 digits', () => {
    const result = maskPhone('12');
    expect(result).toBe(MASK.repeat(10));
  });
});

describe('maskAccountNumber', () => {
  it('masks all but last 4 characters', () => {
    const result = maskAccountNumber('1234567890');
    expect(result).toBe(`${MASK.repeat(6)}7890`);
  });

  it('returns full mask for short account number', () => {
    const result = maskAccountNumber('123');
    expect(result).toBe(MASK.repeat(4));
  });

  it('returns full mask for exactly 4 chars', () => {
    const result = maskAccountNumber('1234');
    expect(result).toBe(MASK.repeat(4));
  });
});

describe('maskSSN', () => {
  it('masks SSN showing last 4 digits', () => {
    const result = maskSSN('123-45-6789');
    expect(result).toBe(`${MASK}${MASK}${MASK}-${MASK}${MASK}-6789`);
  });

  it('returns fully masked SSN for short input', () => {
    const result = maskSSN('12');
    expect(result).toBe(`${MASK}${MASK}${MASK}-${MASK}${MASK}-${MASK}${MASK}${MASK}${MASK}`);
  });
});

describe('maskName', () => {
  it('masks first and last name keeping first letter', () => {
    const result = maskName('John Doe');
    expect(result).toBe(`J${MASK.repeat(3)} D${MASK.repeat(2)}`);
  });

  it('handles single character name parts', () => {
    const result = maskName('J D');
    expect(result).toBe('J D');
  });
});

describe('maskGeneric', () => {
  it('shows first 2 and last 4 by default', () => {
    const result = maskGeneric('ABCDEFGHIJ');
    expect(result).toBe(`AB${MASK.repeat(4)}GHIJ`);
  });

  it('returns all mask chars when value is too short', () => {
    const result = maskGeneric('ABCDE');
    expect(result).toBe(MASK.repeat(5));
  });

  it('respects custom showFirst and showLast', () => {
    const result = maskGeneric('1234567890', 3, 2);
    expect(result).toBe(`123${MASK.repeat(5)}90`);
  });
});
