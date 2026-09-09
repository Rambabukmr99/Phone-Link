import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/date-a-girl/',
  plugins: [react()]
});
