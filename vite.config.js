import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VERCEL ? '/' : '/Date_With_Me/',
  plugins: [react()]
});
