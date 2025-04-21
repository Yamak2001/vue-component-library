# Vue Component Library Documentation

This is a comprehensive Vue 3 component library following a three-tier architecture with TypeScript, Composition API, and script setup syntax.

## Library Architecture

The component library is structured in three tiers:

1. **Core UI Components**: Simple, highly flexible presentation components with no business logic
2. **Composite Components**: Combinations of core components with local state management
3. **Smart Components**: Complex components that use the adapter pattern for API flexibility

### Project Structure

```
src/
├── components/
│   ├── core/          # Core UI components
│   ├── composite/     # Composite components
│   └── smart/         # Smart components with adapters
├── adapters/          # API adapters implementation
├── composables/       # Reusable composition functions
├── styles/
│   ├── tokens/        # Design tokens
│   ├── themes/        # Theme configuration
│   └── utils/         # CSS utilities
├── types/             # TypeScript interfaces and types
└── stores/            # Pinia state management
```

## Installation

```bash
npm install vue-component-library
```

## Quick Start

```js
// Import the library
import { createApp } from 'vue';
import VueComponentLibrary from 'vue-component-library';
import 'vue-component-library/dist/style.css';

import App from './App.vue';

// Create app
const app = createApp(App);

// Use the library
app.use(VueComponentLibrary);

app.mount('#app');
```

## Individual Component Import (Tree-shaking friendly)

```js
// Import only what you need
import { VButton, VInput } from 'vue-component-library';
import 'vue-component-library/dist/style.css';

// In your component
export default {
  components: {
    VButton,
    VInput
  }
}
```

## Core Components

Core components are the basic building blocks of the library. They are simple, highly customizable, and focused on presentation only.

### Available Core Components

- `VButton` - Button component with various styles and states
- `VInput` - Input field component
- `VIcon` - Icon component

### Example: Using the Button Component

```vue
<template>
  <VButton 
    variant="primary" 
    size="md" 
    :loading="isLoading" 
    @click="handleClick"
  >
    Submit
  </VButton>
</template>

<script setup>
import { ref } from 'vue';
import { VButton } from 'vue-component-library';

const isLoading = ref(false);

const handleClick = () => {
  isLoading.value = true;
  // Do something
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
};
</script>
```

## Composite Components

Composite components combine multiple core components and manage local state.

### Available Composite Components

- `VButtonGroup` - Group of buttons with selection capabilities
- `VForm` - Form component with validation

### Example: Using Button Group

```vue
<template>
  <VButtonGroup 
    v-model="selected"
    :selectable="true"
    :multiple="true"
  >
    <VButtonGroupItem value="1">Option 1</VButtonGroupItem>
    <VButtonGroupItem value="2">Option 2</VButtonGroupItem>
    <VButtonGroupItem value="3">Option 3</VButtonGroupItem>
  </VButtonGroup>
  
  <div class="mt-4">
    Selected: {{ selected }}
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VButtonGroup, VButtonGroupItem } from 'vue-component-library';

const selected = ref(['1']);
</script>
```

## Smart Components

Smart components use the adapter pattern to abstract data fetching and manipulation.

### Available Smart Components

- `VDataTable` - Data table with sorting, filtering, and pagination
- `VSearchSelect` - Searchable select with data fetching capabilities

### Example: Using Data Table with Adapter

```vue
<template>
  <VDataTable
    :columns="columns"
    :adapter="userAdapter"
    selectable
    searchable
  >
    <!-- Custom cell rendering -->
    <template #cell(actions)="{ row }">
      <VButton 
        size="sm" 
        variant="danger" 
        @click="deleteUser(row.id)"
      >
        Delete
      </VButton>
    </template>
  </VDataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VDataTable, VButton, createRestDataTableAdapter, createHttpAdapter } from 'vue-component-library';

// Define columns
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'firstName', label: 'First Name', sortable: true, searchable: true },
  { key: 'lastName', label: 'Last Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'actions', label: 'Actions' }
];

// Create HTTP adapter
const httpAdapter = createHttpAdapter('https://api.example.com');

// Create data table adapter
const userAdapter = createRestDataTableAdapter(httpAdapter, '/users');

// Delete user function
const deleteUser = async (id) => {
  if (confirm('Are you sure?')) {
    await userAdapter.deleteRow(id);
    // Refresh table
    await userAdapter.fetchData({
      pagination: { page: 1, pageSize: 10, total: 0 }
    });
  }
};
</script>
```

## Theming

The library supports theming through CSS variables and theme composables.

### Using the Theme System

```vue
<template>
  <div>
    <h2>Current theme: {{ themeName }}</h2>
    <VButton @click="setTheme('light')">Light Theme</VButton>
    <VButton @click="setTheme('dark')">Dark Theme</VButton>
  </div>
</template>

<script setup>
import { VButton, useTheme } from 'vue-component-library';

const { theme, themeName, isDarkMode, setTheme } = useTheme();
</script>
```

### Custom Theming

You can create custom themes by extending the built-in themes:

```js
import { lightTheme } from 'vue-component-library';

// Create a custom theme
const customTheme = {
  ...lightTheme,
  name: 'custom',
  colors: {
    ...lightTheme.colors,
    brand: {
      primary: '#ff0000',   // Red primary color
      secondary: '#cc0000', // Darker red
      tertiary: '#990000',  // Even darker red
    }
  }
};

// Use the custom theme
const { setTheme } = useTheme();
setTheme(customTheme);
```

## Internationalization

The library includes an i18n system that can be used with your components.

### Using the i18n System

```vue
<template>
  <div>
    <p>{{ t('common.welcome') }}</p>
    <VButton>{{ t('common.submit') }}</VButton>
    
    <select v-model="locale" @change="setLocale(locale)">
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VButton, useI18n } from 'vue-component-library';

// Create custom messages
const messages = {
  en: {
    common: {
      welcome: 'Welcome to our application',
      submit: 'Submit',
    }
  },
  fr: {
    common: {
      welcome: 'Bienvenue dans notre application',
      submit: 'Soumettre',
    }
  },
  es: {
    common: {
      welcome: 'Bienvenido a nuestra aplicación',
      submit: 'Enviar',
    }
  }
};

const locale = ref('en');
const { t, setLocale } = useI18n({ 
  locale: locale.value,
  messages
});
</script>
```

## Adapter Pattern

The library uses the adapter pattern to abstract data fetching and manipulation for smart components.

### Available Adapters

- `HttpAdapter` - REST API adapter
- `GraphQLAdapter` - GraphQL API adapter
- `MockAdapter` - Mock adapter for testing

### Creating Custom Adapters

You can create custom adapters by implementing the `DataAdapter` interface:

```ts
import type { DataAdapter, RequestOptions, ApiResponse } from 'vue-component-library';

// Create a custom adapter
class CustomAdapter implements DataAdapter {
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Custom implementation
  }
  
  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Custom implementation
  }
  
  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Custom implementation
  }
  
  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Custom implementation
  }
  
  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Custom implementation
  }
}

// Factory function
export const createCustomAdapter = (): DataAdapter => {
  return new CustomAdapter();
};
```

## Integration with Pinia

The library works well with Pinia for state management.

### Example: Using Components with Pinia Store

```vue
<template>
  <div>
    <VDataTable
      :columns="columns"
      :adapter="userAdapter"
      v-model:selected="selectedUsers"
      @row-select="handleUserSelect"
    />
    
    <div v-if="userStore.loading">Loading...</div>
    <div v-else-if="userStore.error">{{ userStore.error }}</div>
    
    <VButton 
      variant="danger" 
      :disabled="selectedUsers.length === 0"
      @click="deleteSelected"
    >
      Delete Selected
    </VButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VDataTable, VButton, createRestDataTableAdapter, createHttpAdapter } from 'vue-component-library';
import { useUserStore } from '@/stores/userStore';

// Create data table adapter
const httpAdapter = createHttpAdapter('https://api.example.com');
const userAdapter = createRestDataTableAdapter(httpAdapter, '/users');

// Columns definition
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true }
];

// Selected users
const selectedUsers = ref([]);

// Use Pinia store
const userStore = useUserStore();
userStore.setAdapter(httpAdapter);

// Handle user selection
const handleUserSelect = (users) => {
  console.log('Selected users:', users);
};

// Delete selected users
const deleteSelected = async () => {
  if (confirm(`Delete ${selectedUsers.value.length} users?`)) {
    for (const user of selectedUsers.value) {
      await userStore.deleteUser(user.id);
    }
    selectedUsers.value = [];
    await userAdapter.fetchData({
      pagination: { page: 1, pageSize: 10, total: 0 }
    });
  }
};

// Initialize data
onMounted(() => {
  userStore.fetchUsers();
});
</script>
```

## Accessibility

All components are designed to be accessible and WCAG compliant.

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast
- Screen reader support

## Contributing

We welcome contributions to the library! See our [Contributing Guide](CONTRIBUTING.md) for more information.

## License

This library is released under the MIT License.