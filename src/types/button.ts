export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'success' 
  | 'warning' 
  | 'danger';

export interface ButtonProps {
  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  rounded?: boolean;
  icon?: boolean;
  iconPosition?: 'left' | 'right';
  
  // State
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  
  // Attributes
  type?: 'button' | 'submit' | 'reset';
  name?: string;
  value?: string;
  id?: string;
  
  // a11y
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaDisabled?: boolean;
  
  // Events
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export interface ButtonGroupProps {
  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  vertical?: boolean;
  
  // State
  disabled?: boolean;
  
  // Behavior
  selectable?: boolean;
  multiple?: boolean;
  
  // a11y
  ariaLabel?: string;
  role?: string;
}

export interface ButtonGroupItemProps {
  value: string | number;
  selected?: boolean;
  disabled?: boolean;
}

export interface ButtonEvents {
  click: MouseEvent;
  focus: FocusEvent;
  blur: FocusEvent;
}

export interface ButtonGroupEvents {
  'update:selected': string | number | (string | number)[];
  change: string | number | (string | number)[];
}