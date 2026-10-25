import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/vps-proxy': {
        target: 'http://72.60.2.96:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vps-proxy/, ''),
      },
    },
  },
});
