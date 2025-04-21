// src/types/inputGroup.ts
import type { InputProps } from './input';

export interface InputGroupProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  hideLabel?: boolean;
  required?: boolean;
  validated?: boolean;
  valid?: boolean;
}