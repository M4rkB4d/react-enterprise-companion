import { describe, it, expect } from 'vitest';
import { getNumberFormat, getDateFormat } from '../formatter-cache';

describe('formatter-cache', () => {
  describe('getNumberFormat', () => {
    it('returns an Intl.NumberFormat instance', () => {
      const formatter = getNumberFormat('en-US');
      expect(formatter).toBeInstanceOf(Intl.NumberFormat);
    });

    it('returns the same instance on subsequent calls with same args', () => {
      const first = getNumberFormat('en-US', { style: 'currency', currency: 'USD' });
      const second = getNumberFormat('en-US', { style: 'currency', currency: 'USD' });
      expect(first).toBe(second);
    });

    it('returns different instances for different locales', () => {
      const enFormatter = getNumberFormat('en-US');
      const deFormatter = getNumberFormat('de-DE');
      expect(enFormatter).not.toBe(deFormatter);
    });

    it('returns different instances for different options', () => {
      const plainFormatter = getNumberFormat('en-US', {});
      const currencyFormatter = getNumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      expect(plainFormatter).not.toBe(currencyFormatter);
    });

    it('formats numbers correctly for en-US', () => {
      const formatter = getNumberFormat('en-US');
      const result = formatter.format(1234.56);
      expect(result).toContain('1,234.56');
    });

    it('formats numbers correctly for de-DE', () => {
      const formatter = getNumberFormat('de-DE');
      const result = formatter.format(1234.56);
      // German uses . for grouping and , for decimal
      expect(result).toContain('1.234,56');
    });
  });

  describe('getDateFormat', () => {
    it('returns an Intl.DateTimeFormat instance', () => {
      const formatter = getDateFormat('en-US');
      expect(formatter).toBeInstanceOf(Intl.DateTimeFormat);
    });

    it('returns the same instance on subsequent calls with same args', () => {
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const first = getDateFormat('en-US', opts);
      const second = getDateFormat('en-US', opts);
      expect(first).toBe(second);
    });

    it('returns different instances for different locales', () => {
      const enFormatter = getDateFormat('en-US');
      const jaFormatter = getDateFormat('ja-JP');
      expect(enFormatter).not.toBe(jaFormatter);
    });
  });
});
