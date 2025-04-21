// src/types/input.ts
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date';

export interface InputProps {
  // Basic attributes
  type?: InputType;
  name?: string;
  value?: string | number;
  placeholder?: string;
  
  // States
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  
  // Validation
  required?: boolean;
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  
  // A11y
  ariaLabel?: string;
  ariaDescribedby?: string;
}

export interface InputEvents {
  'update:value': [string | number];
  input: [Event];
  focus: [FocusEvent];
  blur: [FocusEvent];
  change: [Event];
}