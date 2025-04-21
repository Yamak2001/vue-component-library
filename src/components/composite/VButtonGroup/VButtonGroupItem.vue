<script setup lang="ts">
import { computed, inject } from 'vue';
import VButton from '@/components/core/VButton/VButton.vue';
import type { ButtonVariant, ButtonSize, ButtonGroupItemProps } from '@/types/button';

// Define props
const props = withDefaults(defineProps<ButtonGroupItemProps>(), {
  selected: false,
  disabled: false,
});

// Get button group context
const buttonGroup = inject<{
  variant: { value: ButtonVariant },
  size: { value: ButtonSize },
  disabled: { value: boolean },
  selectable: { value: boolean },
  multiple: { value: boolean },
  selectItem: (value: string | number) => void,
  isSelected: (value: string | number) => boolean,
}>('buttonGroup', null);

// Handle selection click
const handleClick = () => {
  if (buttonGroup && buttonGroup.selectable.value && !props.disabled) {
    buttonGroup.selectItem(props.value);
  }
};

// Computed props from button group context
const isSelected = computed(() => {
  if (!buttonGroup || !buttonGroup.selectable.value) return props.selected;
  return buttonGroup.isSelected(props.value);
});

const isDisabled = computed(() => {
  return props.disabled || (buttonGroup ? buttonGroup.disabled.value : false);
});

const buttonVariant = computed<ButtonVariant>(() => {
  // If selected, use the variant, otherwise use a more subtle variant
  if (isSelected.value) {
    return buttonGroup ? buttonGroup.variant.value : 'primary';
  }
  return 'tertiary';
});

const buttonSize = computed<ButtonSize>(() => {
  return buttonGroup ? buttonGroup.size.value : 'md';
});
</script>

<template>
  <VButton
    :variant="buttonVariant"
    :size="buttonSize"
    :disabled="isDisabled"
    :active="isSelected"
    :aria-pressed="buttonGroup?.selectable.value ? isSelected : undefined"
    :aria-disabled="isDisabled"
    @click="handleClick"
  >
    <slot></slot>
  </VButton>
</template>