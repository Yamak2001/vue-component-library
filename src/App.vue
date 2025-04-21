<script setup lang="ts">
import { VButton, VButtonGroup, VDataTable, useTheme } from './index';

// Initialize theme if needed
const { theme, setTheme } = useTheme();

// Sample data for VDataTable
const tableData = [
  { id: 1, name: 'Component 1', status: 'Active' },
  { id: 2, name: 'Component 2', status: 'Inactive' },
  { id: 3, name: 'Component 3', status: 'Active' },
];

const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
];

// Toggle theme function
const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Vue Component Library Demo</h1>
      <VButton @click="toggleTheme" variant="secondary">Toggle Theme</VButton>
    </header>

    <main>
      <section class="demo-section">
        <h2>Button Component</h2>
        <div class="component-demo">
          <VButton>Default Button</VButton>
          <VButton variant="primary">Primary Button</VButton>
          <VButton variant="secondary">Secondary Button</VButton>
          <VButton variant="outline">Outline Button</VButton>
          <VButton disabled>Disabled Button</VButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>Button Group Component</h2>
        <div class="component-demo">
          <VButtonGroup>
            <VButton>Button 1</VButton>
            <VButton>Button 2</VButton>
            <VButton>Button 3</VButton>
          </VButtonGroup>
        </div>
      </section>

      <section class="demo-section">
        <h2>Data Table Component</h2>
        <div class="component-demo">
          <VDataTable :data="tableData" :columns="tableColumns" />
        </div>
      </section>
    </main>

    <footer>
      <p>Vue Component Library - Your Library Name</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.demo-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eaeaea;
  border-radius: 8px;
}

h1 {
  font-size: 2rem;
  color: #333;
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.component-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
  text-align: center;
  color: #666;
}
</style>