// src/themes/theme-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type ThemeConfig,
  defaultTheme,
  themeConfigSchema,
} from './schemas';

type ColorMode = 'light' | 'dark' | 'system';

interface ThemeState {
  /** The active theme configuration */
  theme: ThemeConfig;
  /** Color mode preference */
  colorMode: ColorMode;
  /** Resolved color mode (after applying system preference) */
  resolvedColorMode: 'light' | 'dark';
  /** Whether the theme is currently loading */
  isLoading: boolean;
  /** Last error from theme loading */
  error: string | null;
  /** Tenant ID associated with the current theme */
  tenantId: string | null;
}

interface ThemeActions {
  /** Set the active theme (validates with Zod first) */
  setTheme: (config: ThemeConfig) => void;
  /** Load theme from API for a specific tenant */
  loadTenantTheme: (tenantId: string) => Promise<void>;
  /** Set color mode preference */
  setColorMode: (mode: ColorMode) => void;
  /** Reset to default theme */
  resetTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

/**
 * Resolves the effective color mode from the user preference.
 */
function resolveColorMode(preference: ColorMode): 'light' | 'dark' {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return preference;
}

/**
 * Theme store using Zustand with localStorage persistence.
 *
 * @see Doc 04 section 8 for Zustand store patterns
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // State
      theme: defaultTheme,
      colorMode: 'system' as ColorMode,
      resolvedColorMode: resolveColorMode('system'),
      isLoading: false,
      error: null,
      tenantId: null,

      // Actions
      setTheme: (config: ThemeConfig) => {
        const result = themeConfigSchema.safeParse(config);
        if (!result.success) {
          set({
            error: `Invalid theme configuration: ${result.error.message}`,
          });
          return;
        }
        set({ theme: result.data, error: null });
      },

      loadTenantTheme: async (tenantId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `/api/v1/tenants/${tenantId}/theme`,
          );

          if (!response.ok) {
            throw new Error(`Failed to load theme: ${response.status}`);
          }

          const config = await response.json();
          const result = themeConfigSchema.safeParse(config);

          if (!result.success) {
            throw new Error(
              `Invalid theme from API: ${result.error.message}`,
            );
          }

          set({
            theme: result.data,
            tenantId,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Theme load failed';

          console.error(`[Theme] Failed to load tenant theme:`, error);

          set({
            theme: defaultTheme,
            isLoading: false,
            error: message,
          });
        }
      },

      setColorMode: (mode: ColorMode) => {
        set({
          colorMode: mode,
          resolvedColorMode: resolveColorMode(mode),
        });
      },

      resetTheme: () => {
        set({
          theme: defaultTheme,
          tenantId: null,
          error: null,
        });
      },
    }),
    {
      name: 'banking-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        colorMode: state.colorMode,
        tenantId: state.tenantId,
      }),
    },
  ),
);
