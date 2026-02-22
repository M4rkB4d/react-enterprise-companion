import { describe, it, expect } from 'vitest';
import { LocaleNumberParser, getNumberParser } from '../number-parser';

describe('number-parser', () => {
  describe('LocaleNumberParser - en-US', () => {
    const parser = new LocaleNumberParser('en-US');

    it('parses a simple integer', () => {
      expect(parser.parse('1234')).toBe(1234);
    });

    it('parses a number with grouping separators', () => {
      expect(parser.parse('1,234,567')).toBe(1234567);
    });

    it('parses a decimal number', () => {
      expect(parser.parse('1,234.56')).toBe(1234.56);
    });

    it('returns null for empty string', () => {
      expect(parser.parse('')).toBeNull();
    });

    it('returns null for non-string input', () => {
      // @ts-expect-error testing invalid input
      expect(parser.parse(null)).toBeNull();
    });

    it('trims whitespace before parsing', () => {
      expect(parser.parse('  1,234.56  ')).toBe(1234.56);
    });
  });

  describe('LocaleNumberParser - de-DE', () => {
    const parser = new LocaleNumberParser('de-DE');

    it('parses German-formatted numbers (dot grouping, comma decimal)', () => {
      expect(parser.parse('1.234,56')).toBe(1234.56);
    });

    it('parses a simple German integer with grouping', () => {
      expect(parser.parse('1.234.567')).toBe(1234567);
    });
  });

  describe('LocaleNumberParser - fr-FR', () => {
    const parser = new LocaleNumberParser('fr-FR');

    it('parses French-formatted numbers', () => {
      // French uses narrow no-break space (U+202F) or non-breaking space as group separator
      const formatted = new Intl.NumberFormat('fr-FR').format(1234.56);
      expect(parser.parse(formatted)).toBe(1234.56);
    });
  });

  describe('getNumberParser', () => {
    it('returns a LocaleNumberParser instance', () => {
      const parser = getNumberParser('en-US');
      expect(parser).toBeInstanceOf(LocaleNumberParser);
    });

    it('returns the same cached instance for the same locale', () => {
      const first = getNumberParser('ja-JP');
      const second = getNumberParser('ja-JP');
      expect(first).toBe(second);
    });

    it('returns different instances for different locales', () => {
      const enParser = getNumberParser('en-US');
      const deParser = getNumberParser('de-DE');
      expect(enParser).not.toBe(deParser);
    });
  });
});
