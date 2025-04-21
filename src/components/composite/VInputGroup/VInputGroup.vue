<!-- src/components/composite/VInputGroup/VInputGroup.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import VInput from '@/components/core/VInput/VInput.vue';
import type { InputGroupProps } from '@/types/inputGroup';
import type { InputType } from '@/types/input';

// Define props with defaults
const props = withDefaults(defineProps<InputGroupProps>(), {
  label: '',
  helperText: '',
  errorMessage: '',
  successMessage: '',
  hideLabel: false,
  required: false,
  validated: false,
  valid: true,
  type: 'text',
  size: 'md',
});

// Define model
const modelValue = defineModel<string | number>('value');

// Define events
const emit = defineEmits<{
  (e: 'update:value', value: string | number): void;
  (e: 'input', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();

// Generate unique IDs for a11y connections
const uniqueId = `input-${Math.random().toString(36).substring(2, 9)}`;
const inputId = computed(() => props.name || uniqueId);
const helperId = computed(() => `${inputId.value}-helper`);

// Determine if we should show an error state
const hasError = computed(() => props.validated && !props.valid && props.errorMessage);

// Determine if we should show a success state
const hasSuccess = computed(() => props.validated && props.valid && props.successMessage);

// Message to display under input
const displayMessage = computed(() => {
  if (hasError.value) return props.errorMessage;
  if (hasSuccess.value) return props.successMessage;
  return props.helperText;
});

// Classes for the message
const messageClasses = computed(() => {
  if (hasError.value) return 'text-red-600 dark:text-red-400';
  if (hasSuccess.value) return 'text-green-600 dark:text-green-400';
  return 'text-gray-600 dark:text-gray-400';
});

// Handle value updates from the input
const handleUpdateValue = (value: string | number) => {
  modelValue.value = value;
  emit('update:value', value);
};

// Forward events from the input
const handleInput = (event: Event) => emit('input', event);
const handleFocus = (event: FocusEvent) => emit('focus', event);
const handleBlur = (event: FocusEvent) => emit('blur', event);
const handleChange = (event: Event) => emit('change', event);
</script>

<template>
  <div class="v-input-group">
    <!-- Label -->
    <label 
      v-if="!hideLabel" 
      :for="inputId" 
      class="block text-sm font-medium mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Input with forwarded props -->
    <VInput
      :id="inputId"
      :type="type"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :loading="loading"
      :required="required"
      :pattern="pattern"
      :minlength="minlength"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :size="size"
      :variant="hasError ? 'error' : variant"
      :aria-describedby="displayMessage ? helperId : undefined"
      @update:value="handleUpdateValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    >
      <!-- Pass through slots -->
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix"></slot>
      </template>
      
      <template v-if="$slots.suffix" #suffix>
        <slot name="suffix"></slot>
      </template>
    </VInput>
    
    <!-- Helper text, error message, or success message -->
    <p 
      v-if="displayMessage" 
      :id="helperId" 
      :class="['text-xs mt-1', messageClasses]"
    >
      {{ displayMessage }}
    </p>
    
    <!-- Slot for additional validation messages -->
    <slot name="validation"></slot>
  </div>
</template>