// src/index.ts
// Core components
import VButton from './components/core/VButton/VButton.vue';
import VInput from './components/core/VInput/VInput.vue';

// Composite components
import VButtonGroup from './components/composite/VButtonGroup/VButtonGroup.vue';
import VInputGroup from './components/composite/VInputGroup/VInputGroup.vue';

// Smart components
import VDataTable from './components/smart/VDataTable/VDataTable.vue';
import VAutoComplete from './components/smart/VAutoComplete/VAutoComplete.vue';

// Adapters
import { createHttpAdapter } from './adapters/httpAdapter';
import { createGraphQLAdapter } from './adapters/graphQLAdapter';
import { createMockAdapter } from './adapters/mockAdapter';
import { createRestDataTableAdapter, createGraphQLDataTableAdapter } from './adapters/dataTableAdapter';
import { createRestAutoCompleteAdapter, createClientSideAutoCompleteAdapter } from './adapters/autoCompleteAdapter';

// Export individual components for tree-shaking
export {
  // Core components
  VButton,
  VInput,
  
  // Composite components
  VButtonGroup,
  VInputGroup,
  
  // Smart components
  VDataTable,
  VAutoComplete,
  
  // Adapters
  createHttpAdapter,
  createGraphQLAdapter,
  createMockAdapter,
  createRestDataTableAdapter,
  createGraphQLDataTableAdapter,
  createRestAutoCompleteAdapter,
  createClientSideAutoCompleteAdapter
};

// Vue plugin
import { App } from 'vue';

export default {
  install(app: App) {
    // Register core components
    app.component('VButton', VButton);
    app.component('VInput', VInput);
    
    // Register composite components
    app.component('VButtonGroup', VButtonGroup);
    app.component('VInputGroup', VInputGroup);
    
    // Register smart components
    app.component('VDataTable', VDataTable);
    app.component('VAutoComplete', VAutoComplete);
  }
};