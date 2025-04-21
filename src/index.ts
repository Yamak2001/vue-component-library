// Core components
import VButton from './components/core/VButton/VButton.vue';
// import VInput from './components/core/VInput/VInput.vue';
// import VIcon from './components/core/VIcon/VIcon.vue';

// Composite components
import VButtonGroup from './components/composite/VButtonGroup/VButtonGroup.vue';
// import VForm from './components/composite/VForm/VForm.vue';

// Smart components
import VDataTable from './components/smart/VDataTable/VDataTable.vue';
// import VSearchSelect from './components/smart/VSearchSelect/VSearchSelect.vue';

// Composables
import { useTheme } from './composables/useTheme';
import { useI18n } from './composables/useI18n';

// Types
import type { ButtonSize, ButtonVariant } from './types/button';
// import type { InputType } from './types/input';
import type { ThemeOptions } from './types/theme';

// Adapters
import { createHttpAdapter } from './adapters/httpAdapter';
import { createGraphQLAdapter } from './adapters/graphQLAdapter';

// Individual component exports for tree-shaking
export {
  // Core components
  VButton,
//   VInput,
//   VIcon,
  
  // Composite components
  VButtonGroup,
//   VForm,
  
  // Smart components
  VDataTable,
//   VSearchSelect,
  
  // Composables
  useTheme,
  useI18n,
  
  // Types
  ButtonSize,
  ButtonVariant,
//   InputType,
  ThemeOptions,
  
  // Adapters
  createHttpAdapter,
  createGraphQLAdapter,
};

// Plugin for global registration
import { App } from 'vue';

export default {
  install(app: App) {
    // Register core components
    app.component('VButton', VButton);
    // app.component('VInput', VInput);
    // app.component('VIcon', VIcon);
    
    // Register composite components
    app.component('VButtonGroup', VButtonGroup);
    // app.component('VForm', VForm);
    
    // Register smart components
    app.component('VDataTable', VDataTable);
    // app.component('VSearchSelect', VSearchSelect);
  }
};