export interface TranslationMessages {
    [key: string]: string | TranslationMessages;
  }
  
  export interface I18nOptions {
    locale: string;
    fallbackLocale: string;
    messages: Record<string, TranslationMessages>;
  }
  
  export interface I18nInstance {
    locale: string;
    t: (key: string, params?: Record<string, any>) => string;
    setLocale: (locale: string) => void;
    getLocale: () => string;
    availableLocales: () => string[];
  }