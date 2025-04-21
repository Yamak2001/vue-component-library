<!-- src/components/core/VInput/VInput.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from '@/composables/useTheme';
import type { InputProps, InputType } from '@/types/input';

// Define props with defaults and validation
const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  variant: 'default',
  disabled: false,
  readonly: false,
  loading: false,
  required: false,
});

// Define model value
const modelValue = defineModel<string | number>('value');

// Define events
const emit = defineEmits<{
  (e: 'update:value', value: string | number): void;
  (e: 'input', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();

// Use composables
const { theme, isDarkMode } = useTheme();

// Internal input element ref
const inputRef = ref<HTMLInputElement | null>(null);

// Handle input changes
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = props.type === 'number' ? parseFloat(target.value) : target.value;
  
  modelValue.value = newValue;
  emit('update:value', newValue);
  emit('input', event);
};

// Handle focus and blur
const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleChange = (event: Event) => {
  emit('change', event);
};

// Focus method for programmatic focusing
const focus = () => {
  inputRef.value?.focus();
};

// Calculate classes based on props
const inputClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4',
  };
  
  const variantClasses = {
    default: 'border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600',
    outlined: 'border-2 border-primary-500 bg-transparent',
    filled: 'bg-gray-100 dark:bg-gray-800 border-transparent',
  };
  
  return [
    // Base styles
    'w-full rounded-md transition-colors duration-200 focus:outline-none',
    'focus:ring-2 focus:ring-primary-500/50',
    
    // Size and variant styles
    sizeClasses[props.size],
    variantClasses[props.variant],
    
    // States
    props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : '',
    props.readonly ? 'bg-gray-50 dark:bg-gray-900' : '',
    props.loading ? 'pr-10' : '',
  ].filter(Boolean).join(' ');
});

// Expose methods and properties
defineExpose({
  focus,
  inputElement: inputRef,
});
</script>

<template>
  <div class="v-input relative">
    <!-- Input element -->
    <input
      ref="inputRef"
      :class="inputClasses"
      :type="type"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :required="required"
      :pattern="pattern"
      :minlength="minlength"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    />
    
    <!-- Loading spinner -->
    <div 
      v-if="loading" 
      class="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <div class="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
    </div>
    
    <!-- Slot for prefix icon -->
    <div 
      v-if="$slots.prefix" 
      class="absolute left-3 top-1/2 transform -translate-y-1/2"
    >
      <slot name="prefix"></slot>
    </div>
    
    <!-- Slot for suffix icon -->
    <div 
      v-if="$slots.suffix && !loading" 
      class="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<style scoped>
.v-input {
  width: 100%;
}

/* Add padding for prefix */
.v-input:has([name="prefix"]) input {
  padding-left: 2.5rem;
}

/* Add padding for suffix */
.v-input:has([name="suffix"]) input {
  padding-right: 2.5rem;
}
</style>