import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/vps-proxy': {
        target: 'https://eteyelo.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/vps-proxy/, ''),
      },
    },
  },
});
