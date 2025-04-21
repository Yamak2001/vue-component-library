export interface ThemeColors {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      [key: string]: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
      [key: string]: string;
    };
    brand: {
      primary: string;
      secondary: string;
      tertiary: string;
      [key: string]: string;
    };
    status: {
      success: string;
      warning: string;
      danger: string;
      info: string;
      [key: string]: string;
    };
    border: {
      light: string;
      medium: string;
      dark: string;
      [key: string]: string;
    };
    [key: string]: Record<string, string>;
  }
  
  export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    [key: string]: string;
  }
  
  export interface ThemeOptions {
    name: string;
    colors: ThemeColors;
    shadows: ThemeShadows;
    focusRing: string;
    [key: string]: any;
  }
  
  export type ThemeName = 'light' | 'dark' | 'system' | string;