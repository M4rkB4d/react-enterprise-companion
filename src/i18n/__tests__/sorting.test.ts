import { describe, it, expect } from 'vitest';
import { createCollator, sortByLocale } from '../sorting';

describe('sorting', () => {
  describe('createCollator', () => {
    it('returns a comparator function', () => {
      const compare = createCollator('en-US');
      expect(typeof compare).toBe('function');
    });

    it('sorts "apple" before "banana"', () => {
      const compare = createCollator('en-US');
      expect(compare('apple', 'banana')).toBeLessThan(0);
    });

    it('sorts equal strings as equal', () => {
      const compare = createCollator('en-US');
      expect(compare('hello', 'hello')).toBe(0);
    });

    it('performs numeric sorting (e.g., "2" before "10")', () => {
      const compare = createCollator('en-US');
      // With numeric: true (the default), "2" should come before "10"
      expect(compare('item2', 'item10')).toBeLessThan(0);
    });

    it('uses base sensitivity by default (case-insensitive)', () => {
      const compare = createCollator('en-US');
      expect(compare('Apple', 'apple')).toBe(0);
    });
  });

  describe('sortByLocale', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];

    it('sorts objects by a string key in ascending order', () => {
      const sorted = sortByLocale(items, 'name', 'en-US');
      expect(sorted.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('sorts objects by a string key in descending order', () => {
      const sorted = sortByLocale(items, 'name', 'en-US', 'desc');
      expect(sorted.map((i) => i.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    it('does not mutate the original array', () => {
      const original = [...items];
      sortByLocale(items, 'name', 'en-US');
      expect(items).toEqual(original);
    });

    it('handles items with numeric string values correctly', () => {
      const numItems = [{ label: 'item10' }, { label: 'item2' }, { label: 'item1' }];
      const sorted = sortByLocale(numItems, 'label', 'en-US');
      expect(sorted.map((i) => i.label)).toEqual(['item1', 'item2', 'item10']);
    });
  });
});
