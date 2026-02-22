import { describe, it, expect } from 'vitest';
import { pseudoLocalize, createPseudoMessages } from '../pseudo-locale';

describe('pseudo-locale', () => {
  describe('pseudoLocalize', () => {
    it('wraps output in square brackets', () => {
      const result = pseudoLocalize('Hello');
      expect(result.startsWith('[')).toBe(true);
      expect(result.endsWith(']')).toBe(true);
    });

    it('transforms ASCII letters to accented equivalents', () => {
      const result = pseudoLocalize('abc');
      // Should not contain original letters a, b, c in the transformed portion
      // The result should be wrapped and contain accented characters
      expect(result).not.toContain('[abc');
    });

    it('adds padding (~30% longer) with tilde characters', () => {
      const input = 'Hello World';
      const result = pseudoLocalize(input);
      const expectedPaddingLength = Math.ceil(input.length * 0.3);
      const expectedTildes = '~'.repeat(expectedPaddingLength);
      // The result should end with tildes before the closing bracket
      expect(result).toContain(expectedTildes + ']');
    });

    it('preserves ICU message syntax variables', () => {
      const result = pseudoLocalize('Hello {name}');
      // The {name} part should be preserved as-is
      expect(result).toContain('{name}');
    });

    it('preserves nested ICU syntax', () => {
      const result = pseudoLocalize('{count, plural, one {item} other {items}}');
      // All braced content should be preserved
      expect(result).toContain('{count, plural, one {item} other {items}}');
    });

    it('preserves HTML tags', () => {
      const result = pseudoLocalize('Click <b>here</b> now');
      expect(result).toContain('<b>');
      expect(result).toContain('</b>');
    });

    it('does not transform characters inside HTML tags', () => {
      const result = pseudoLocalize('<strong>bold</strong>');
      // The tag names "strong" should be unchanged
      expect(result).toContain('<strong>');
      expect(result).toContain('</strong>');
    });

    it('preserves numbers and special characters', () => {
      const result = pseudoLocalize('Price: $100');
      // Numbers and $ should pass through unchanged
      expect(result).toContain('$');
      expect(result).toContain('100');
    });
  });

  describe('createPseudoMessages', () => {
    it('transforms all values in a message bundle', () => {
      const source = {
        greeting: 'Hello',
        farewell: 'Goodbye',
      };
      const pseudo = createPseudoMessages(source);
      expect(Object.keys(pseudo)).toEqual(['greeting', 'farewell']);
      // Each value should be pseudo-localized (wrapped in brackets)
      expect(pseudo['greeting'].startsWith('[')).toBe(true);
      expect(pseudo['farewell'].startsWith('[')).toBe(true);
    });

    it('preserves the keys of the source bundle', () => {
      const source = { 'app.title': 'My App', 'app.desc': 'Description' };
      const pseudo = createPseudoMessages(source);
      expect(pseudo).toHaveProperty('app.title');
      expect(pseudo).toHaveProperty('app.desc');
    });

    it('handles empty source bundle', () => {
      const pseudo = createPseudoMessages({});
      expect(pseudo).toEqual({});
    });
  });
});
