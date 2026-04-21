import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aperi21/',
  server: {
    port: 5173,
    strictPort: false,
  },
});
