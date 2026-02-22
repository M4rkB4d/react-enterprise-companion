import { describe, it, expect } from 'vitest';
import { themeConfigSchema, defaultTheme } from '../schemas';

/**
 * Build a valid theme config for testing.
 * The defaultTheme uses relative URLs (e.g., '/logo.svg') which fail
 * z.string().url() validation. This helper patches URLs to be absolute.
 */
function makeValidTheme() {
  return {
    ...defaultTheme,
    logoUrl: 'https://example.com/logo.svg',
    logoAlt: defaultTheme.logoAlt,
  };
}

describe('themeConfigSchema', () => {
  it('validates a complete valid theme config', () => {
    const valid = makeValidTheme();
    const result = themeConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects a theme missing brandName', () => {
    const { brandName: _brandName, ...rest } = makeValidTheme();
    const result = themeConfigSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a theme with an invalid hex color', () => {
    const invalid = {
      ...makeValidTheme(),
      colors: {
        ...defaultTheme.colors,
        primary: 'not-a-color',
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts valid 3-digit hex colors', () => {
    const valid = {
      ...makeValidTheme(),
      colors: {
        ...defaultTheme.colors,
        primary: '#f00',
      },
    };
    const result = themeConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects hex colors with invalid characters', () => {
    const invalid = {
      ...makeValidTheme(),
      colors: {
        ...defaultTheme.colors,
        primary: '#gggggg',
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid logoUrl (not a URL)', () => {
    const invalid = {
      ...makeValidTheme(),
      logoUrl: 'not-a-url',
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts a theme without optional darkColors', () => {
    const valid = makeValidTheme();
    const { darkColors: _darkColors, ...rest } = valid as Record<string, unknown>;
    const result = themeConfigSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts a theme without optional shadows', () => {
    const valid = makeValidTheme();
    const { shadows: _shadows, ...rest } = valid as Record<string, unknown>;
    const result = themeConfigSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts a theme without optional components', () => {
    const valid = makeValidTheme();
    const { components: _components, ...rest } = valid as Record<string, unknown>;
    const result = themeConfigSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('rejects invalid CSS size in typography.fontSizeBase', () => {
    const invalid = {
      ...makeValidTheme(),
      typography: {
        ...defaultTheme.typography,
        fontSizeBase: '16',
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts valid CSS size values (px, rem, em)', () => {
    const base = makeValidTheme();

    const withRem = {
      ...base,
      typography: { ...defaultTheme.typography, fontSizeBase: '1rem' },
    };
    expect(themeConfigSchema.safeParse(withRem).success).toBe(true);

    const withEm = {
      ...base,
      typography: { ...defaultTheme.typography, fontSizeBase: '1.5em' },
    };
    expect(themeConfigSchema.safeParse(withEm).success).toBe(true);
  });

  it('rejects fontWeightNormal outside valid range (> 900)', () => {
    const invalid = {
      ...makeValidTheme(),
      typography: {
        ...defaultTheme.typography,
        fontWeightNormal: 1000,
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects lineHeightBase outside valid range (> 3)', () => {
    const invalid = {
      ...makeValidTheme(),
      typography: {
        ...defaultTheme.typography,
        lineHeightBase: 5,
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid borderRadiusFull value (must be literal "9999px")', () => {
    const invalid = {
      ...makeValidTheme(),
      shape: {
        ...defaultTheme.shape,
        borderRadiusFull: '10px',
      },
    };
    const result = themeConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
