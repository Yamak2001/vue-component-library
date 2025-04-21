import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DataAdapter } from '@/types/adapter';
import type { User } from '@/types/user'; // You'd create this type

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // API adapter (will be injected)
  let adapter: DataAdapter | null = null;
  
  // Getters
  const userCount = computed(() => users.value.length);
  const isAuthenticated = computed(() => !!currentUser.value);
  const activeUsers = computed(() => users.value.filter(user => user.active));
  
  // Set the API adapter
  function setAdapter(apiAdapter: DataAdapter) {
    adapter = apiAdapter;
  }
  
  // Actions
  async function fetchUsers() {
    if (!adapter) {
      error.value = 'API adapter not set';
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adapter.get<User[]>('/users');
      users.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchUserById(id: string | number) {
    if (!adapter) {
      error.value = 'API adapter not set';
      return null;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adapter.get<User>(`/users/${id}`);
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to fetch user ${id}`;
      console.error(`Error fetching user ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function createUser(userData: Partial<User>) {
    if (!adapter) {
      error.value = 'API adapter not set';
      return null;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adapter.post<User>('/users', userData);
      const newUser = response.data;
      users.value.push(newUser);
      return newUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error creating user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateUser(id: string | number, userData: Partial<User>) {
    if (!adapter) {
      error.value = 'API adapter not set';
      return null;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adapter.put<User>(`/users/${id}`, userData);
      const updatedUser = response.data;
      
      // Update in the local array
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      
      // Update current user if needed
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = updatedUser;
      }
      
      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to update user ${id}`;
      console.error(`Error updating user ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteUser(id: string | number) {
    if (!adapter) {
      error.value = 'API adapter not set';
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      await adapter.delete(`/users/${id}`);
      
      // Remove from the local array
      users.value = users.value.filter(user => user.id !== id);
      
      // Clear current user if deleted
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to delete user ${id}`;
      console.error(`Error deleting user ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function login(email: string, password: string) {
    if (!adapter) {
      error.value = 'API adapter not set';
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adapter.post<{ user: User; token: string }>('/login', { email, password });
      currentUser.value = response.data.user;
      
      // Store the token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  function logout() {
    currentUser.value = null;
    localStorage.removeItem('auth_token');
  }
  
  // Initialize from localStorage if available
  function initAuth() {
    const token = localStorage.getItem('auth_token');
    if (token && adapter) {
      // Set the auth token in the adapter's headers
      adapter.get('/me').then(response => {
        currentUser.value = response.data;
      }).catch(() => {
        // Token might be invalid or expired
        localStorage.removeItem('auth_token');
      });
    }
  }
  
  return {
    // State
    users,
    currentUser,
    loading,
    error,
    
    // Getters
    userCount,
    isAuthenticated,
    activeUsers,
    
    // Actions
    setAdapter,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    logout,
    initAuth
  };
});