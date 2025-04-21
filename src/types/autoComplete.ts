// src/types/autoComplete.ts
import type { InputProps } from './input';
import type { DataAdapter } from './adapter';

export interface AutoCompleteOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export interface AutoCompleteProps extends Omit<InputProps, 'type'> {
  adapter?: DataAdapter;
  endpoint?: string;
  options?: AutoCompleteOption[];
  valueKey?: string;
  labelKey?: string;
  minChars?: number;
  maxItems?: number;
  loadingText?: string;
  noResultsText?: string;
  debounce?: number;
  fetchMode?: 'client' | 'server';
  exactMatch?: boolean;
}

export interface AutoCompleteEvents {
  'update:value': [string | number];
  'update:selected': [AutoCompleteOption | null];
  'search': [string];
  'option-click': [AutoCompleteOption];
  'open': [void];
  'close': [void];
}