<!-- src/components/smart/VAutoComplete/VAutoComplete.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import VInput from '@/components/core/VInput/VInput.vue';
import type { AutoCompleteProps, AutoCompleteOption } from '@/types/autoComplete';
import {
  createClientSideAutoCompleteAdapter,
  createRestAutoCompleteAdapter
} from '@/adapters/autoCompleteAdapter';

// Define props
const props = withDefaults(defineProps<AutoCompleteProps>(), {
  valueKey: 'id',
  labelKey: 'name',
  minChars: 2,
  maxItems: 10,
  loadingText: 'Loading...',
  noResultsText: 'No results found',
  debounce: 300,
  fetchMode: 'server',
  exactMatch: false,
  options: () => [],
});

// Define models
const modelValue = defineModel<string | number>('value');
const selectedOption = defineModel<AutoCompleteOption | null>('selected', { default: null });

// Define emits
const emit = defineEmits<{
  (e: 'update:value', value: string | number): void;
  (e: 'update:selected', option: AutoCompleteOption | null): void;
  (e: 'search', query: string): void;
  (e: 'option-click', option: AutoCompleteOption): void;
  (e: 'open'): void;
  (e: 'close'): void;
}>();

// Internal state
const inputValue = ref('');
const isOpen = ref(false);
const isFocused = ref(false);
const isLoading = ref(false);
const results = ref<AutoCompleteOption[]>([]);
const searchQuery = ref('');
const debounceTimeout = ref<number | null>(null);

// Create adapter based on props
const adapter = computed(() => {
  if (props.adapter) {
    return props.fetchMode === 'server' && props.endpoint
      ? createRestAutoCompleteAdapter(props.adapter, props.endpoint, props.valueKey, props.labelKey)
      : createClientSideAutoCompleteAdapter(props.options);
  }
  
  // Default to client-side filtering if no adapter
  return createClientSideAutoCompleteAdapter(props.options);
});

// Sync model value with input value
watch(modelValue, (newValue) => {
  if (newValue !== undefined) {
    // Try to find the option by value
    const option = props.options.find(opt => opt.value === newValue);
    if (option) {
      inputValue.value = option.label;
      selectedOption.value = option;
    } else {
      // If not found and we have an exact match requirement, keep the display value
      inputValue.value = typeof newValue === 'string' ? newValue : String(newValue);
    }
  } else {
    inputValue.value = '';
    selectedOption.value = null;
  }
}, { immediate: true });

// Handle input changes
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  inputValue.value = target.value;
  
  // Clear selected option when typing
  if (selectedOption.value && selectedOption.value.label !== target.value) {
    selectedOption.value = null;
  }
  
  // Update model with raw input value if not requiring exact matches
  if (!props.exactMatch) {
    modelValue.value = target.value;
    emit('update:value', target.value);
  }
  
  // Debounce search
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value);
  debounceTimeout.value = setTimeout(() => {
    searchQuery.value = target.value;
    
    if (target.value.length >= props.minChars) {
      performSearch(target.value);
    } else {
      results.value = [];
    }
  }, props.debounce);
};

// Perform search using adapter
const performSearch = async (query: string) => {
  if (query.length < props.minChars) {
    results.value = [];
    return;
  }
  
  isLoading.value = true;
  emit('search', query);
  
  try {
    const searchResults = await adapter.value.search(query);
    results.value = searchResults.slice(0, props.maxItems);
    
    // Open dropdown if we have results
    if (searchResults.length > 0) {
      isOpen.value = true;
    }
  } catch (error) {
    console.error('Search error:', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Handle option selection
const selectOption = (option: AutoCompleteOption) => {
  inputValue.value = option.label;
  modelValue.value = option.value;
  selectedOption.value = option;
  
  emit('update:value', option.value);
  emit('update:selected', option);
  emit('option-click', option);
  
  isOpen.value = false;
};

// Handle focus/blur
const handleFocus = () => {
  isFocused.value = true;
  
  // Open dropdown if we have a value and results
  if (inputValue.value.length >= props.minChars) {
    performSearch(inputValue.value);
  }
};

const handleBlur = (event: FocusEvent) => {
  // Short delay to allow clicking options
  setTimeout(() => {
    // If requiring exact match and no option selected, reset
    if (props.exactMatch && !selectedOption.value) {
      inputValue.value = '';
      modelValue.value = '';
      emit('update:value', '');
    }
    
    isFocused.value = false;
    isOpen.value = false;
    emit('close');
  }, 200);
};

// Close dropdown on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false;
    emit('close');
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && !event.composedPath().includes(document.getElementById('autocomplete-container') as Node)) {
    isOpen.value = false;
    emit('close');
  }
};

// Setup click outside event
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div id="autocomplete-container" class="v-autocomplete relative">
    <!-- Input field -->
    <VInput
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :size="size"
      :loading="isLoading"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >
      <!-- Add dropdown icon -->
      <template #suffix>
        <slot name="suffix">
          <span 
            class="cursor-pointer"
            @click="isOpen = !isOpen; isOpen && emit('open')"
          >
            ▼
          </span>
        </slot>
      </template>
    </VInput>
    
    <!-- Dropdown menu -->
    <div 
      v-if="isOpen && (isLoading || results.length > 0 || searchQuery.length >= minChars)"
      class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
    >
      <!-- Loading state -->
      <div v-if="isLoading" class="p-3 text-center text-gray-500">
        {{ loadingText }}
      </div>
      
      <!-- No results -->
      <div 
        v-else-if="results.length === 0 && searchQuery.length >= minChars" 
        class="p-3 text-center text-gray-500"
      >
        {{ noResultsText }}
      </div>
      
      <!-- Results list -->
      <ul v-else class="py-1">
        <li 
          v-for="option in results" 
          :key="option.value"
          class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          @click="selectOption(option)"
        >
          <slot name="option" :option="option">
            {{ option.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>