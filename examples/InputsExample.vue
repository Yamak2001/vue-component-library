<!-- examples/InputsExample.vue -->
<template>
    <div class="examples-container">
      <h1>Form Controls Examples</h1>
      
      <section>
        <h2>Basic Input</h2>
        <VInput 
          v-model:value="basicValue" 
          placeholder="Type something..." 
        />
        <p>Value: {{ basicValue }}</p>
      </section>
      
      <section>
        <h2>Input Group</h2>
        <VInputGroup
          v-model:value="emailValue"
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          helperText="We'll never share your email"
          required
        >
          <template #prefix>✉️</template>
        </VInputGroup>
        <p>Value: {{ emailValue }}</p>
      </section>
      
      <section>
        <h2>Form Validation</h2>
        <VInputGroup
          v-model:value="usernameValue"
          label="Username"
          placeholder="Choose a username"
          :validated="usernameValidated"
          :valid="usernameValid"
          errorMessage="Username must be at least 3 characters"
          successMessage="Username is available"
          @blur="validateUsername"
        />
      </section>
      
      <section>
        <h2>Auto Complete (Client-side)</h2>
        <VAutoComplete
          v-model:value="fruitValue"
          v-model:selected="selectedFruit"
          placeholder="Search for a fruit..."
          :options="fruits"
          minChars="1"
          fetchMode="client"
        />
        <p>Selected: {{ selectedFruit?.label || 'None' }}</p>
      </section>
      
      <section>
        <h2>Auto Complete (Server-side)</h2>
        <VAutoComplete
          v-model:value="userValue"
          placeholder="Search for a user..."
          :adapter="mockAdapter"
          endpoint="/users"
          minChars="1"
          fetchMode="server"
        />
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { 
    VInput, 
    VInputGroup, 
    VAutoComplete,
    createMockAdapter
  } from '../src';
  
  // Basic input
  const basicValue = ref('');
  
  // Input group
  const emailValue = ref('');
  
  // Validation example
  const usernameValue = ref('');
  const usernameValidated = ref(false);
  const usernameValid = ref(false);
  
  const validateUsername = () => {
    usernameValidated.value = true;
    usernameValid.value = usernameValue.value.length >= 3;
  };
  
  // Client-side autocomplete
  const fruitValue = ref('');
  const selectedFruit = ref(null);
  const fruits = [
    { value: 1, label: 'Apple' },
    { value: 2, label: 'Banana' },
    { value: 3, label: 'Cherry' },
    { value: 4, label: 'Date' },
    { value: 5, label: 'Elderberry' },
    { value: 6, label: 'Fig' },
    { value: 7, label: 'Grape' },
  ];
  
  // Server-side autocomplete with mock adapter
  const userValue = ref('');
  const mockAdapter = createMockAdapter();
  
  // Set up mock response for users endpoint
  mockAdapter.setMockResponse('/users', 'GET', (requestConfig) => {
    const searchQuery = requestConfig.params?.search?.toLowerCase() || '';
    
    const allUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
      { id: 4, name: 'Bob Brown', email: 'bob@example.com' },
      { id: 5, name: 'Charlie Davis', email: 'charlie@example.com' }
    ];
    
    // Filter users based on search
    const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery) || 
      user.email.toLowerCase().includes(searchQuery)
    );
    
    return {
      data: filteredUsers
    };
  });
  </script>
  
  <style>
  .examples-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  
  section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #2d3748;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  p {
    margin-top: 0.75rem;
    color: #718096;
  }
  </style>