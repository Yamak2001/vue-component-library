import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  
  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
      }),
    ],
    build: isProduction ? {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'), // Changed from main.ts to index.ts
        name: 'VueComponentLibrary',
        formats: ['es', 'umd'],
        fileName: (format) => `vue-component-library.${format}.js`,
      },
      rollupOptions: {
        external: ['vue', 'pinia'],
        output: {
          globals: {
            vue: 'Vue',
            pinia: 'Pinia',
          },
          exports: 'named',
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    } : undefined, // Use default build options for development
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
});