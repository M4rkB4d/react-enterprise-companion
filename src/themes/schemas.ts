// src/themes/schemas.ts

import { z } from 'zod';

/**
 * Validates a hex color string (#RGB or #RRGGBB).
 */
const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    error: 'validation.invalidColor',
  });

/**
 * Validates a CSS size value (e.g., '8px', '0.5rem', '1em').
 */
const cssSize = z
  .string()
  .regex(/^\d+(\.\d+)?(px|rem|em)$/, {
    error: 'validation.invalidSize',
  });

/**
 * Validates a font family string.
 */
const fontFamily = z.string().min(1, { error: 'validation.required' });

/**
 * Complete theme configuration schema.
 * ~30 design tokens covering all visual aspects of the white-label.
 *
 * @see Doc 06 section 3 for Zod schema patterns
 */
export const themeConfigSchema = z.object({
  // --- Brand Identity ---
  brandName: z.string().min(1, { error: 'validation.required' }),
  logoUrl: z.string().url({ error: 'validation.invalidUrl' }),
  logoAlt: z.string().min(1, { error: 'validation.required' }),
  faviconUrl: z.string().url({ error: 'validation.invalidUrl' }).optional(),

  // --- Color Palette ---
  colors: z.object({
    primary: hexColor,
    primaryHover: hexColor,
    primaryActive: hexColor,
    primaryForeground: hexColor,

    secondary: hexColor,
    secondaryHover: hexColor,
    secondaryForeground: hexColor,

    accent: hexColor,
    accentForeground: hexColor,

    destructive: hexColor,
    destructiveForeground: hexColor,

    success: hexColor,
    successForeground: hexColor,

    warning: hexColor,
    warningForeground: hexColor,

    background: hexColor,
    foreground: hexColor,

    card: hexColor,
    cardForeground: hexColor,

    border: hexColor,
    input: hexColor,
    ring: hexColor,

    muted: hexColor,
    mutedForeground: hexColor,
  }),

  // --- Dark Mode Colors ---
  darkColors: z
    .object({
      primary: hexColor,
      primaryHover: hexColor,
      primaryActive: hexColor,
      primaryForeground: hexColor,

      background: hexColor,
      foreground: hexColor,

      card: hexColor,
      cardForeground: hexColor,

      border: hexColor,
      input: hexColor,
      ring: hexColor,

      muted: hexColor,
      mutedForeground: hexColor,
    })
    .optional(),

  // --- Typography ---
  typography: z.object({
    fontFamily: fontFamily,
    fontFamilyMono: fontFamily.optional(),
    fontSizeBase: cssSize,
    fontWeightNormal: z.number().int().min(100).max(900),
    fontWeightMedium: z.number().int().min(100).max(900),
    fontWeightBold: z.number().int().min(100).max(900),
    lineHeightBase: z.number().min(1).max(3),
    letterSpacing: z.string().optional(),
  }),

  // --- Spacing & Shape ---
  shape: z.object({
    borderRadius: cssSize,
    borderRadiusLg: cssSize,
    borderRadiusSm: cssSize,
    borderRadiusFull: z.literal('9999px').optional(),
    borderWidth: cssSize.optional(),
  }),

  // --- Shadows ---
  shadows: z
    .object({
      sm: z.string(),
      md: z.string(),
      lg: z.string(),
    })
    .optional(),

  // --- Component-Specific Tokens ---
  components: z
    .object({
      buttonHeight: cssSize.optional(),
      inputHeight: cssSize.optional(),
      headerHeight: cssSize.optional(),
      sidebarWidth: cssSize.optional(),
    })
    .optional(),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

/**
 * Default theme -- used when no tenant theme is configured.
 * This serves as the base/fallback theme.
 */
export const defaultTheme: ThemeConfig = {
  brandName: 'Enterprise Banking',
  logoUrl: '/logo.svg',
  logoAlt: 'Enterprise Banking Logo',

  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryActive: '#1e40af',
    primaryForeground: '#ffffff',

    secondary: '#64748b',
    secondaryHover: '#475569',
    secondaryForeground: '#ffffff',

    accent: '#8b5cf6',
    accentForeground: '#ffffff',

    destructive: '#dc2626',
    destructiveForeground: '#ffffff',

    success: '#16a34a',
    successForeground: '#ffffff',

    warning: '#d97706',
    warningForeground: '#ffffff',

    background: '#ffffff',
    foreground: '#0f172a',

    card: '#ffffff',
    cardForeground: '#0f172a',

    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#2563eb',

    muted: '#f1f5f9',
    mutedForeground: '#64748b',
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, Consolas, monospace',
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeightBase: 1.5,
  },

  shape: {
    borderRadius: '8px',
    borderRadiusLg: '12px',
    borderRadiusSm: '4px',
    borderRadiusFull: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },

  components: {
    buttonHeight: '40px',
    inputHeight: '40px',
    headerHeight: '64px',
    sidebarWidth: '256px',
  },
};
