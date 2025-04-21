import type { ThemeOptions } from '@/types/theme';

// Default light theme
export const lightTheme: ThemeOptions = {
  name: 'light',
  colors: {
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#334155', 
      tertiary: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff',
    },
    // Brand colors
    brand: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      tertiary: '#0369a1',
    },
    // Status colors
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    },
    // Border colors
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  focusRing: '0 0 0 3px rgba(14, 165, 233, 0.5)',
};

// Dark theme
export const darkTheme: ThemeOptions = {
  name: 'dark',
  colors: {
    // Background colors
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    // Text colors
    text: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      tertiary: '#cbd5e1',
      disabled: '#64748b',
      inverse: '#0f172a',
    },
    // Brand colors
    brand: {
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      tertiary: '#0284c7',
    },
    // Status colors
    status: {
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#60a5fa',
    },
    // Border colors
    border: {
      light: '#334155',
      medium: '#475569',
      dark: '#64748b',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  },
  focusRing: '0 0 0 3px rgba(56, 189, 248, 0.5)',
};

// System theme (uses user's system preference)
export const systemTheme = (): ThemeOptions => {
  if (typeof window === 'undefined') {
    return lightTheme;
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? darkTheme : lightTheme;
};

// Export all themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  system: systemTheme(),
};

// Default theme
export const defaultTheme = 'system';