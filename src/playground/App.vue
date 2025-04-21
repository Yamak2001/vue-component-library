<template>
  <div class="playground">
    <h1>Component Library Playground</h1>
    
    <section>
      <h2>VButton</h2>
      <VButton>Default Button</VButton>
      <VButton variant="primary">Primary Button</VButton>
      <VButton variant="secondary" size="small">Small Secondary Button</VButton>
    </section>
    
    <section>
      <h2>VButtonGroup</h2>
      <VButtonGroup>
        <VButton>Button 1</VButton>
        <VButton>Button 2</VButton>
        <VButton>Button 3</VButton>
      </VButtonGroup>
    </section>
    
    <section>
      <h2>VDataTable</h2>
      <VDataTable 
        :columns="tableColumns" 
        :adapter="tableAdapter" 
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { VButton, VButtonGroup, VDataTable } from '../index';
import { ref } from 'vue';

// Define table columns
const tableColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true }
];

// Create a simple mock adapter
const tableAdapter = {
  fetchData: async (request) => {
    // Sample data
    const tableData = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    ];
    
    // Return in the format expected by the DataTable
    return {
      data: tableData,
      total: tableData.length,
      page: request.pagination.page,
      pageSize: request.pagination.pageSize
    };
  }
};
</script>

<style>
.playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>