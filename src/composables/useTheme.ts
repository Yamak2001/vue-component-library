import { ref, computed, watch, onMounted } from 'vue';
import { lightTheme, darkTheme, systemTheme, defaultTheme } from '@/styles/themes/theme';
import type { ThemeOptions, ThemeName } from '@/types/theme';

// Create a global theme state that persists between component instances
const currentThemeName = ref<ThemeName>(defaultTheme);
const currentThemeOptions = ref<ThemeOptions>(
  defaultTheme === 'system' ? systemTheme() : defaultTheme === 'dark' ? darkTheme : lightTheme
);

// Function to set CSS variables based on theme
const applyThemeToDOM = (theme: ThemeOptions) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([colorGroup, colors]) => {
    Object.entries(colors).forEach(([colorName, colorValue]) => {
      root.style.setProperty(`--color-${colorGroup}-${colorName}`, colorValue);
    });
  });
  
  // Apply shadow variables
  Object.entries(theme.shadows).forEach(([shadowName, shadowValue]) => {
    root.style.setProperty(`--shadow-${shadowName}`, shadowValue);
  });
  
  // Apply focus ring
  root.style.setProperty('--focus-ring', theme.focusRing);
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', theme.name);
};

export function useTheme() {
  // Initialize theme
  onMounted(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem('app-theme') as ThemeName | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    
    // Watch for system theme changes if using system theme
    if (currentThemeName.value === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (currentThemeName.value === 'system') {
          currentThemeOptions.value = mediaQuery.matches ? darkTheme : lightTheme;
          applyThemeToDOM(currentThemeOptions.value);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  });
  
  // Watch for theme changes
  watch(currentThemeOptions, (newTheme) => {
    applyThemeToDOM(newTheme);
  }, { immediate: true });
  
  // Set the theme and save preference
  const setTheme = (themeName: ThemeName) => {
    currentThemeName.value = themeName;
    
    if (themeName === 'system') {
      currentThemeOptions.value = systemTheme();
    } else if (themeName === 'dark') {
      currentThemeOptions.value = darkTheme;
    } else if (themeName === 'light') {
      currentThemeOptions.value = lightTheme;
    }
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-theme', themeName);
    }
  };
  
  // Check if using dark mode
  const isDarkMode = computed(() => {
    return currentThemeOptions.value.name === 'dark';
  });
  
  return {
    theme: computed(() => currentThemeOptions.value),
    themeName: computed(() => currentThemeName.value),
    isDarkMode,
    setTheme,
  };
}