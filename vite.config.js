import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.jsx'],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      path: 'path-browserify', // For Node.js compatibility in browser
      '@helpers': path.resolve(__dirname, 'resources/js/helpers'), // ✅ Fixes unresolved import
      '@components': path.resolve(__dirname, 'resources/js/Components'), // Optional: helps with cleaner imports
    },
  },
  optimizeDeps: {
    exclude: ['lightningcss'], // ✅ Prevents Vite from trying to pre-bundle native module
  },
});
