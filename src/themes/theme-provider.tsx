// src/themes/theme-provider.tsx

import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from './theme-store';
import type { ThemeConfig } from './schemas';

interface ThemeProviderProps {
  children: ReactNode;
  /** Optional tenant ID to load theme for */
  tenantId?: string;
}

/**
 * Applies theme CSS custom properties to the :root element.
 *
 * All components use `var(--color-primary)` etc. instead of
 * hardcoded colors. Changing the theme updates all components
 * instantly without re-rendering.
 *
 * @see Doc 02 section 9 for provider stack placement
 */
export function ThemeProvider({ children, tenantId }: ThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme);
  const resolvedColorMode = useThemeStore((s) => s.resolvedColorMode);
  const loadTenantTheme = useThemeStore((s) => s.loadTenantTheme);

  // Load tenant-specific theme on mount
  useEffect(() => {
    if (tenantId) {
      loadTenantTheme(tenantId);
    }
  }, [tenantId, loadTenantTheme]);

  // Apply CSS custom properties whenever theme or color mode changes
  useEffect(() => {
    applyThemeToDOM(theme, resolvedColorMode);
  }, [theme, resolvedColorMode]);

  // Listen for system color scheme changes
  useEffect(() => {
    const colorMode = useThemeStore.getState().colorMode;
    if (colorMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      useThemeStore.setState({
        resolvedColorMode: e.matches ? 'dark' : 'light',
      });
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return <>{children}</>;
}

/**
 * Applies theme configuration as CSS custom properties on :root.
 */
function applyThemeToDOM(
  theme: ThemeConfig,
  colorMode: 'light' | 'dark',
): void {
  const root = document.documentElement;
  const isDark = colorMode === 'dark';

  // Determine which color set to use
  const colors = isDark && theme.darkColors
    ? { ...theme.colors, ...theme.darkColors }
    : theme.colors;

  // --- Color tokens ---
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-primary-active', colors.primaryActive);
  root.style.setProperty('--color-primary-fg', colors.primaryForeground);

  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-hover', colors.secondaryHover);
  root.style.setProperty('--color-secondary-fg', colors.secondaryForeground);

  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-fg', colors.accentForeground);

  root.style.setProperty('--color-destructive', colors.destructive);
  root.style.setProperty('--color-destructive-fg', colors.destructiveForeground);

  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-success-fg', colors.successForeground);

  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-warning-fg', colors.warningForeground);

  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-foreground', colors.foreground);

  root.style.setProperty('--color-card', colors.card);
  root.style.setProperty('--color-card-fg', colors.cardForeground);

  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-input', colors.input);
  root.style.setProperty('--color-ring', colors.ring);

  root.style.setProperty('--color-muted', colors.muted);
  root.style.setProperty('--color-muted-fg', colors.mutedForeground);

  // --- Typography tokens ---
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  if (theme.typography.fontFamilyMono) {
    root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);
  }
  root.style.setProperty('--font-size-base', theme.typography.fontSizeBase);
  root.style.setProperty('--font-weight-normal', String(theme.typography.fontWeightNormal));
  root.style.setProperty('--font-weight-medium', String(theme.typography.fontWeightMedium));
  root.style.setProperty('--font-weight-bold', String(theme.typography.fontWeightBold));
  root.style.setProperty('--line-height-base', String(theme.typography.lineHeightBase));

  // --- Shape tokens ---
  root.style.setProperty('--radius', theme.shape.borderRadius);
  root.style.setProperty('--radius-lg', theme.shape.borderRadiusLg);
  root.style.setProperty('--radius-sm', theme.shape.borderRadiusSm);

  // --- Shadow tokens ---
  if (theme.shadows) {
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
  }

  // --- Component tokens ---
  if (theme.components) {
    if (theme.components.buttonHeight)
      root.style.setProperty('--button-height', theme.components.buttonHeight);
    if (theme.components.inputHeight)
      root.style.setProperty('--input-height', theme.components.inputHeight);
    if (theme.components.headerHeight)
      root.style.setProperty('--header-height', theme.components.headerHeight);
    if (theme.components.sidebarWidth)
      root.style.setProperty('--sidebar-width', theme.components.sidebarWidth);
  }

  // --- Dark mode class ---
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
