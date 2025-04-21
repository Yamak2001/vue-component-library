<script setup lang="ts">
import { ref, computed, provide, toRef } from 'vue';
import VButton from '@/components/core/VButton/VButton.vue';
import type { ButtonGroupProps, ButtonVariant, ButtonSize } from '@/types/button';

// Define props
const props = withDefaults(defineProps<ButtonGroupProps>(), {
  variant: 'primary',
  size: 'md',
  vertical: false,
  disabled: false,
  selectable: false,
  multiple: false,
  role: 'group',
  ariaLabel: 'Button group',
});

// Define model value for selected items - fix: don't reference props in defineModel
const modelValue = defineModel<string | number | (string | number)[]>();

// Define events
const emit = defineEmits<{
  (e: 'update:selected', value: string | number | (string | number)[]): void;
  (e: 'change', value: string | number | (string | number)[]): void;
}>();

// Internal state for selection if not using v-model
// Initialize with modelValue or default based on multiple prop
const selectedInternal = ref<string | number | (string | number)[]>(
  modelValue.value !== undefined ? modelValue.value : (props.multiple ? [] : undefined)
);

// Computed selected state (using v-model if available, otherwise internal state)
const selected = computed({
  get: () => modelValue.value ?? selectedInternal.value,
  set: (value) => {
    selectedInternal.value = value;
    modelValue.value = value;
    emit('update:selected', value);
    emit('change', value);
  }
});

// Handle selection of an item
const selectItem = (value: string | number) => {
  if (!props.selectable || props.disabled) return;
  
  if (props.multiple) {
    // Handle multiple selection (toggle)
    const currentSelected = Array.isArray(selected.value) ? [...selected.value] : [];
    const index = currentSelected.indexOf(value);
    
    if (index === -1) {
      // Add to selection
      currentSelected.push(value);
    } else {
      // Remove from selection
      currentSelected.splice(index, 1);
    }
    
    selected.value = currentSelected;
  } else {
    // Handle single selection (radio-like behavior)
    selected.value = selected.value === value ? undefined : value;
  }
};

// Check if an item is selected
const isSelected = (value: string | number): boolean => {
  if (Array.isArray(selected.value)) {
    return selected.value.includes(value);
  }
  return selected.value === value;
};

// Button group context for child components
provide('buttonGroup', {
  variant: toRef(props, 'variant'),
  size: toRef(props, 'size'),
  disabled: toRef(props, 'disabled'),
  vertical: toRef(props, 'vertical'),
  selectable: toRef(props, 'selectable'),
  multiple: toRef(props, 'multiple'),
  selectItem,
  isSelected,
});

// Compute container classes
const containerClasses = computed(() => {
  return [
    'inline-flex',
    props.vertical ? 'flex-col' : 'flex-row',
    'rounded-md',
    'overflow-hidden',
    props.disabled ? 'opacity-60 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');
});
</script>

<template>
  <div 
    :class="containerClasses"
    :role="role"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :data-selectable="selectable"
    :data-multiple="multiple"
  >
    <!-- Handle default slot rendering -->
    <slot></slot>
    
    <!-- No items slot -->
    <slot v-if="$slots.default?.length === 0" name="empty">
      <span class="text-neutral-500 p-2">No buttons provided</span>
    </slot>
  </div>
</template>

<style scoped>
/* Join the buttons without space/border radius between them */
:deep(button) {
  border-radius: 0;
  margin: 0;
}

/* Apply border radius to first and last buttons */
.flex-row > :deep(button:first-child) {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.flex-row > :deep(button:last-child) {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.flex-col > :deep(button:first-child) {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.flex-col > :deep(button:last-child) {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

/* Add subtle border between buttons */
.flex-row > :deep(button:not(:last-child)) {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.flex-col > :deep(button:not(:last-child)) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>