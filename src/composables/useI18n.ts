import { ref, computed } from 'vue';
import type { I18nOptions, TranslationMessages, I18nInstance } from '@/types/i18n';

// Default messages
const defaultMessages: Record<string, TranslationMessages> = {
  en: {
    common: {
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      loading: 'Loading...',
      search: 'Search',
      noResults: 'No results found',
      more: 'More',
      less: 'Less',
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      min: 'This field must be at least {min} characters',
      max: 'This field must be less than {max} characters',
      numeric: 'This field must be a number',
    },
    errors: {
      default: 'An error occurred',
      network: 'Network error',
      notFound: 'Not found',
    },
  },
  es: {
    common: {
      submit: 'Enviar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      loading: 'Cargando...',
      search: 'Buscar',
      noResults: 'No se encontraron resultados',
      more: 'Más',
      less: 'Menos',
    },
    validation: {
      required: 'Este campo es obligatorio',
      email: 'Introduce un correo electrónico válido',
      min: 'Este campo debe tener al menos {min} caracteres',
      max: 'Este campo debe tener menos de {max} caracteres',
      numeric: 'Este campo debe ser un número',
    },
    errors: {
      default: 'Ocurrió un error',
      network: 'Error de red',
      notFound: 'No encontrado',
    },
  },
};

// Global i18n state
const currentLocale = ref('en');
const currentMessages = ref<Record<string, TranslationMessages>>(defaultMessages);
const fallbackLocale = ref('en');

// Get nested value by key path
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  return keys.reduce((o, key) => {
    return o?.[key] ?? null;
  }, obj);
};

// Format string with parameters
const formatString = (str: string, params?: Record<string, any>): string => {
  if (!params) return str;
  
  return str.replace(/{(\w+)}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
};

export function useI18n(options?: Partial<I18nOptions>): I18nInstance {
  // Initialize with options
  if (options) {
    if (options.locale) {
      currentLocale.value = options.locale;
    }
    
    if (options.fallbackLocale) {
      fallbackLocale.value = options.fallbackLocale;
    }
    
    if (options.messages) {
      // Merge with default messages
      Object.entries(options.messages).forEach(([locale, messages]) => {
        if (!currentMessages.value[locale]) {
          currentMessages.value[locale] = messages;
        } else {
          currentMessages.value[locale] = {
            ...currentMessages.value[locale],
            ...messages,
          };
        }
      });
    }
  }
  
  // Translate function
  const t = (key: string, params?: Record<string, any>): string => {
    const messages = currentMessages.value[currentLocale.value];
    let result = getNestedValue(messages, key);
    
    // Fallback if not found
    if (!result && currentLocale.value !== fallbackLocale.value) {
      const fallbackMessages = currentMessages.value[fallbackLocale.value];
      result = getNestedValue(fallbackMessages, key);
    }
    
    // Return key if not found
    if (!result || typeof result !== 'string') {
      return key;
    }
    
    return formatString(result, params);
  };
  
  // Set locale
  const setLocale = (locale: string): void => {
    if (currentMessages.value[locale]) {
      currentLocale.value = locale;
      
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app-locale', locale);
      }
    } else {
      console.warn(`Locale "${locale}" not available`);
    }
  };
  
  // Get current locale
  const getLocale = (): string => currentLocale.value;
  
  // Get available locales
  const availableLocales = (): string[] => Object.keys(currentMessages.value);
  
  return {
    locale: currentLocale.value,
    t,
    setLocale,
    getLocale,
    availableLocales,
  };
}

// Initialize from localStorage if available
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const storedLocale = localStorage.getItem('app-locale');
  if (storedLocale && defaultMessages[storedLocale]) {
    currentLocale.value = storedLocale;
  }
}