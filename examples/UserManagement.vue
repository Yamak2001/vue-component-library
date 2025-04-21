<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import {
  VButton,
  VDataTable,
  VInput,
  VButtonGroup,
  VButtonGroupItem,
  createHttpAdapter,
  createRestDataTableAdapter,
  useTheme,
  useI18n
} from 'vue-component-library';
import type { DataTableColumn, DataTableFilter } from 'vue-component-library';
import type { User, UserUpdateRequest } from '@/types/user';

// Initialize the router
const router = useRouter();

// Get user store from Pinia
const userStore = useUserStore();

// Use composables from the library
const { setTheme, isDarkMode } = useTheme();
const { t, setLocale } = useI18n();

// Setup state
const loading = ref(false);
const selectedUsers = ref<User[]>([]);
const showUserModal = ref(false);
const currentUser = ref<User | null>(null);
const searchQuery = ref('');
const roleFilter = ref<string | null>(null);

// Create HTTP adapter
const httpAdapter = createHttpAdapter('https://api.example.com');

// Initialize the user store with our adapter
userStore.setAdapter(httpAdapter);

// Create data table adapter using the adapter pattern
const userTableAdapter = createRestDataTableAdapter<User>(
  httpAdapter,
  '/users'
);

// Define the table columns
const columns = ref<DataTableColumn[]>([
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    align: 'center'
  },
  {
    key: 'firstName',
    label: 'First Name',
    sortable: true,
    searchable: true,
  },
  {
    key: 'lastName',
    label: 'Last Name',
    sortable: true,
    searchable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    searchable: true,
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    filterable: true,
    align: 'center',
    formatter: (value) => {
      const roles: Record<string, string> = {
        'admin': 'Administrator',
        'editor': 'Editor',
        'viewer': 'Viewer'
      };
      return roles[value] || value;
    }
  },
  {
    key: 'active',
    label: 'Status',
    sortable: true,
    filterable: true,
    align: 'center',
    renderFn: (value) => {
      return value ? 
        '<span class="text-green-500">Active</span>' : 
        '<span class="text-red-500">Inactive</span>';
    }
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    align: 'right',
    formatter: (value) => {
      return new Date(value).toLocaleDateString();
    }
  }
]);

// Computed filters based on current state
const tableFilters = computed<DataTableFilter[]>(() => {
  const filters: DataTableFilter[] = [];
  
  if (roleFilter.value) {
    filters.push({
      key: 'role',
      value: roleFilter.value,
      operator: 'eq'
    });
  }
  
  return filters;
});

// Load initial data
onMounted(async () => {
  await userStore.fetchUsers();
});

// CRUD operations
const handleAddUser = () => {
  currentUser.value = null;
  showUserModal.value = true;
};

const handleEditUser = (user: User) => {
  currentUser.value = { ...user };
  showUserModal.value = true;
};

const handleViewUser = (user: User) => {
  router.push(`/users/${user.id}`);
};

const handleDeleteUser = async (user: User) => {
  if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
    loading.value = true;
    try {
      await userStore.deleteUser(user.id);
      await refreshData();
    } finally {
      loading.value = false;
    }
  }
};

const handleDeleteSelected = async () => {
  if (!selectedUsers.value.length) return;
  
  if (confirm(`Are you sure you want to delete ${selectedUsers.value.length} selected users?`)) {
    loading.value = true;
    try {
      for (const user of selectedUsers.value) {
        await userStore.deleteUser(user.id);
      }
      selectedUsers.value = [];
      await refreshData();
    } finally {
      loading.value = false;
    }
  }
};

const saveUser = async (userData: UserUpdateRequest) => {
  loading.value = true;
  try {
    if (currentUser.value?.id) {
      // Update existing user
      await userStore.updateUser(currentUser.value.id, userData);
    } else {
      // Create new user
      await userStore.createUser(userData as any);
    }
    showUserModal.value = false;
    await refreshData();
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await userTableAdapter.fetchData({
    pagination: { page: 1, pageSize: 10, total: 0 },
    search: searchQuery.value,
    filters: tableFilters.value
  });
};

// Filter by role
const setRoleFilter = (role: string | null) => {
  roleFilter.value = role;
  refreshData();
};

// Toggle theme
const toggleTheme = () => {
  setTheme(isDarkMode.value ? 'light' : 'dark');
};

// Language toggle
const toggleLanguage = (lang: string) => {
  setLocale(lang);
};
</script>

<template>
  <div class="user-management p-6">
    <header class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">{{ t('users.management') }}</h1>
      
      <div class="flex gap-4">
        <!-- Theme toggle -->
        <VButton 
          variant="ghost" 
          icon 
          @click="toggleTheme"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <template #icon>
            <span v-if="isDarkMode">🌞</span>
            <span v-else>🌙</span>
          </template>
        </VButton>
        
        <!-- Language toggle -->
        <VButtonGroup>
          <VButtonGroupItem 
            value="en" 
            :selected="true" 
            @click="toggleLanguage('en')"
          >
            EN
          </VButtonGroupItem>
          <VButtonGroupItem 
            value="es" 
            @click="toggleLanguage('es')"
          >
            ES
          </VButtonGroupItem>
        </VButtonGroup>
      </div>
    </header>
    
    <!-- Filters and actions bar -->
    <div class="flex flex-wrap justify-between mb-4 gap-4">
      <!-- Search input -->
      <VInput
        v-model="searchQuery"
        :placeholder="t('users.searchPlaceholder')"
        @input="refreshData"
      >
        <template #prefix>
          🔍
        </template>
      </VInput>
      
      <!-- Role filter -->
      <VButtonGroup class="mb-4" selectable>
        <VButtonGroupItem 
          value="all" 
          :selected="roleFilter === null"
          @click="setRoleFilter(null)"
        >
          {{ t('users.allRoles') }}
        </VButtonGroupItem>
        <VButtonGroupItem 
          value="admin" 
          :selected="roleFilter === 'admin'"
          @click="setRoleFilter('admin')"
        >
          {{ t('users.roles.admin') }}
        </VButtonGroupItem>
        <VButtonGroupItem 
          value="editor" 
          :selected="roleFilter === 'editor'"
          @click="setRoleFilter('editor')"
        >
          {{ t('users.roles.editor') }}
        </VButtonGroupItem>
        <VButtonGroupItem 
          value="viewer" 
          :selected="roleFilter === 'viewer'"
          @click="setRoleFilter('viewer')"
        >
          {{ t('users.roles.viewer') }}
        </VButtonGroupItem>
      </VButtonGroup>
      
      <!-- Action buttons -->
      <div class="flex gap-2">
        <VButton 
          variant="danger" 
          :disabled="selectedUsers.length === 0"
          @click="handleDeleteSelected"
        >
          {{ t('users.deleteSelected') }} ({{ selectedUsers.length }})
        </VButton>
        
        <VButton 
          variant="primary" 
          @click="handleAddUser"
        >
          {{ t('users.addNew') }}
        </VButton>
      </div>
    </div>
    
    <!-- Data table -->
    <VDataTable
      :columns="columns"
      :adapter="userTableAdapter"
      v-model:selected="selectedUsers"
      :selectable="true"
      :multiSelect="true"
      :filterable="true"
      :searchable="true"
      :filters="tableFilters"
      :search="searchQuery"
      :striped="true"
      :hoverable="true"
      :bordered="true"
    >
      <!-- Custom actions column -->
      <template #rowActions="{ row }">
        <div class="flex items-center gap-2">
          <VButton 
            size="xs" 
            variant="tertiary" 
            @click="handleViewUser(row)"
          >
            {{ t('users.view') }}
          </VButton>
          
          <VButton 
            size="xs" 
            variant="secondary" 
            @click="handleEditUser(row)"
          >
            {{ t('users.edit') }}
          </VButton>
          
          <VButton 
            size="xs" 
            variant="danger" 
            @click="handleDeleteUser(row)"
          >
            {{ t('users.delete') }}
          </VButton>
        </div>
      </template>
    </VDataTable>
    
    <!-- User form modal (placeholder) -->
    <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ currentUser ? t('users.editUser') : t('users.addUser') }}
        </h2>
        
        <!-- User form would go here -->
        
        <div class="flex justify-end gap-2 mt-4">
          <VButton 
            variant="tertiary" 
            @click="showUserModal = false"
          >
            {{ t('common.cancel') }}
          </VButton>
          
          <VButton 
            variant="primary" 
            :loading="loading"
            @click="saveUser(currentUser || {})"
          >
            {{ t('common.save') }}
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>