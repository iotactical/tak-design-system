import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/tak-design-system/',
  resolve: {
    alias: {
      '@tokens': resolve(__dirname, '../tokens/w3c'),
      '@platforms': resolve(__dirname, '../platforms'),
      '@data': resolve(__dirname, '../data'),
      '@tak-react': resolve(__dirname, '../packages/react/src'),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
});
