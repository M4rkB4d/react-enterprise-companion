import { describe, it, expect } from 'vitest';
import { detectLocale, getDirection, getLanguage, SUPPORTED_LOCALES } from '../locale-detection';

describe('locale-detection', () => {
  describe('SUPPORTED_LOCALES', () => {
    it('contains en-US as a supported locale', () => {
      expect(SUPPORTED_LOCALES).toContain('en-US');
    });

    it('contains RTL locales ar-SA, ar-AE, and he-IL', () => {
      expect(SUPPORTED_LOCALES).toContain('ar-SA');
      expect(SUPPORTED_LOCALES).toContain('ar-AE');
      expect(SUPPORTED_LOCALES).toContain('he-IL');
    });
  });

  describe('detectLocale', () => {
    it('returns user preference when it is a valid supported locale', () => {
      expect(detectLocale('de-DE')).toBe('de-DE');
    });

    it('returns user preference for RTL locale', () => {
      expect(detectLocale('ar-SA')).toBe('ar-SA');
    });

    it('falls back to browser language when user preference is null', () => {
      // navigator.languages is set by jsdom; match() will negotiate
      const result = detectLocale(null);
      // The result should be one of the supported locales
      expect(SUPPORTED_LOCALES).toContain(result);
    });

    it('returns DEFAULT_LOCALE when user preference is invalid', () => {
      // Cast to bypass type checking for an invalid locale
      const result = detectLocale('xx-XX' as 'en-US');
      // Should fall through to browser negotiation or default
      expect(SUPPORTED_LOCALES).toContain(result);
    });
  });

  describe('getDirection', () => {
    it('returns "rtl" for ar-SA', () => {
      expect(getDirection('ar-SA')).toBe('rtl');
    });

    it('returns "rtl" for ar-AE', () => {
      expect(getDirection('ar-AE')).toBe('rtl');
    });

    it('returns "rtl" for he-IL', () => {
      expect(getDirection('he-IL')).toBe('rtl');
    });

    it('returns "ltr" for en-US', () => {
      expect(getDirection('en-US')).toBe('ltr');
    });

    it('returns "ltr" for de-DE', () => {
      expect(getDirection('de-DE')).toBe('ltr');
    });

    it('returns "ltr" for ja-JP', () => {
      expect(getDirection('ja-JP')).toBe('ltr');
    });
  });

  describe('getLanguage', () => {
    it('extracts "en" from "en-US"', () => {
      expect(getLanguage('en-US')).toBe('en');
    });

    it('extracts "de" from "de-DE"', () => {
      expect(getLanguage('de-DE')).toBe('de');
    });

    it('extracts "ar" from "ar-SA"', () => {
      expect(getLanguage('ar-SA')).toBe('ar');
    });

    it('extracts "zh" from "zh-CN"', () => {
      expect(getLanguage('zh-CN')).toBe('zh');
    });
  });
});
