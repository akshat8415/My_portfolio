import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/My_portfolio/', // Replace with your repo name if different
  plugins: [react()],
});
