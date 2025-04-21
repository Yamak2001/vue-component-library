<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useI18n } from '@/composables/useI18n';
import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types/button';


// Define props with defaults and validation
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  rounded: false,
  icon: false,
  iconPosition: 'left',
  loading: false,
  disabled: false,
  active: false,
  type: 'button',
});

// Define events
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}>();

// Use composables
const { theme, isDarkMode } = useTheme();
const { t } = useI18n();

// Button size classes
const sizeClasses = computed(() => {
  const sizes: Record<ButtonSize, string> = {
    xs: 'text-xs h-6 px-2 py-1',
    sm: 'text-sm h-8 px-3 py-1.5',
    md: 'text-base h-10 px-4 py-2',
    lg: 'text-lg h-12 px-5 py-2.5',
    xl: 'text-xl h-14 px-6 py-3',
  };
  
  // If it's an icon button, adjust padding to create a square
  if (props.icon) {
    const heights: Record<ButtonSize, string> = {
      xs: 'h-6 w-6 p-1',
      sm: 'h-8 w-8 p-1.5',
      md: 'h-10 w-10 p-2',
      lg: 'h-12 w-12 p-2.5',
      xl: 'h-14 w-14 p-3',
    };
    return heights[props.size];
  }
  
  return sizes[props.size];
});

// Button variant classes
const variantClasses = computed(() => {
  const variants: Record<ButtonVariant, string> = {
    primary: `
      bg-brand-primary text-white hover:bg-brand-secondary
      active:bg-brand-tertiary focus:ring-2 focus:ring-brand-primary/50
    `,
    secondary: `
      bg-neutral-200 text-neutral-800 hover:bg-neutral-300
      active:bg-neutral-400 focus:ring-2 focus:ring-neutral-300/50
    `,
    tertiary: `
      bg-transparent text-neutral-600 hover:bg-neutral-100
      active:bg-neutral-200 focus:ring-2 focus:ring-neutral-200/50
    `,
    outline: `
      bg-transparent border border-current text-brand-primary
      hover:bg-brand-primary/10 active:bg-brand-primary/20
      focus:ring-2 focus:ring-brand-primary/50
    `,
    ghost: `
      bg-transparent text-neutral-600 hover:bg-neutral-100
      active:bg-neutral-200 focus:outline-none
    `,
    link: `
      bg-transparent text-brand-primary underline hover:text-brand-secondary
      active:text-brand-tertiary focus:outline-none p-0 h-auto
    `,
    success: `
      bg-status-success text-white hover:bg-status-success/90
      active:bg-status-success/80 focus:ring-2 focus:ring-status-success/50
    `,
    warning: `
      bg-status-warning text-white hover:bg-status-warning/90
      active:bg-status-warning/80 focus:ring-2 focus:ring-status-warning/50
    `,
    danger: `
      bg-status-danger text-white hover:bg-status-danger/90
      active:bg-status-danger/80 focus:ring-2 focus:ring-status-danger/50
    `,
  };
  
  return variants[props.variant];
});

// Compute all button classes
const buttonClasses = computed(() => {
  let classes = [
    // Base styles for all buttons
    'relative inline-flex items-center justify-center',
    'font-medium transition-colors duration-200',
    'focus:outline-none focus-visible:ring-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    
    // Size & variant specific
    sizeClasses.value,
    variantClasses.value,
    
    // Additional styling options
    props.block ? 'w-full' : '',
    props.rounded ? 'rounded-full' : 'rounded-md',
    props.active ? 'ring-2 ring-opacity-50' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ];
  
  return classes.filter(Boolean).join(' ');
});

// Icon position classes
const contentClasses = computed(() => {
  if (!props.icon && slots.default && slots.icon) {
    return `inline-flex items-center gap-2 ${props.iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`;
  }
  return '';
});

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  
  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

// Check slots
const slots = useSlots();
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-disabled="ariaDisabled ?? disabled"
    :aria-busy="loading"
    :aria-pressed="ariaPressed"
    :aria-expanded="ariaExpanded"
    :aria-controls="ariaControls"
    :aria-describedby="ariaDescribedby"
    :aria-label="ariaLabel"
    :name="name"
    :value="value"
    :id="id"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span class="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full" />
    </div>
    
    <!-- Content with opacity when loading -->
    <div :class="[contentClasses, loading ? 'opacity-0' : '']">
      <!-- Icon only -->
      <slot v-if="icon" name="icon">
        <!-- Default icon slot content if needed -->
      </slot>
      
      <!-- Text with optional icon -->
      <template v-else>
        <slot name="icon" v-if="slots.icon && iconPosition === 'left'" />
        
        <slot>{{ t('common.submit') }}</slot>
        
        <slot name="icon" v-if="slots.icon && iconPosition === 'right'" />
      </template>
    </div>
  </button>
</template>

<style scoped>
/* Any additional scoped CSS */
</style>