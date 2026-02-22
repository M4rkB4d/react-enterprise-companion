import { describe, it, expect } from 'vitest';
import {
  generateCSPHeader,
  mergeCSPDirectives,
  getBankingCSP,
  BASE_CSP_DIRECTIVES,
} from '../utils/csp-generator';
import type { CSPDirectives } from '../utils/csp-generator';

describe('generateCSPHeader', () => {
  it('generates a semicolon-separated CSP string from directives', () => {
    const directives: CSPDirectives = {
      ...BASE_CSP_DIRECTIVES,
    };
    const header = generateCSPHeader(directives);
    expect(header).toContain("default-src 'self'");
    expect(header).toContain("script-src 'self'");
    expect(header).toContain("object-src 'none'");
    expect(header).toContain('; ');
  });

  it('omits directives with empty arrays', () => {
    const directives: CSPDirectives = {
      ...BASE_CSP_DIRECTIVES,
      'frame-src': [],
    };
    const header = generateCSPHeader(directives);
    expect(header).not.toContain('frame-src');
  });
});

describe('mergeCSPDirectives', () => {
  it('adds new sources to existing directives', () => {
    const merged = mergeCSPDirectives(BASE_CSP_DIRECTIVES, {
      'script-src': ['https://cdn.example.com'],
    });
    expect(merged['script-src']).toContain("'self'");
    expect(merged['script-src']).toContain('https://cdn.example.com');
  });

  it('deduplicates values when merging', () => {
    const merged = mergeCSPDirectives(BASE_CSP_DIRECTIVES, {
      'script-src': ["'self'"],
    });
    const selfCount = merged['script-src'].filter((v) => v === "'self'").length;
    expect(selfCount).toBe(1);
  });

  it('does not mutate the base directives', () => {
    const originalScriptSrc = [...BASE_CSP_DIRECTIVES['script-src']];
    mergeCSPDirectives(BASE_CSP_DIRECTIVES, {
      'script-src': ['https://new.example.com'],
    });
    expect(BASE_CSP_DIRECTIVES['script-src']).toEqual(originalScriptSrc);
  });
});

describe('getBankingCSP', () => {
  it('includes Stripe script source', () => {
    const csp = getBankingCSP();
    expect(csp).toContain('https://js.stripe.com');
  });

  it('includes Stripe frame source', () => {
    const csp = getBankingCSP();
    expect(csp).toContain('frame-src');
    expect(csp).toContain('https://js.stripe.com');
  });

  it('includes Stripe connect source', () => {
    const csp = getBankingCSP();
    expect(csp).toContain('https://api.stripe.com');
  });

  it('still includes base self directive', () => {
    const csp = getBankingCSP();
    expect(csp).toContain("default-src 'self'");
  });
});
