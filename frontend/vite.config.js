import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: 'index.html',
        designPreview: 'design-preview.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
    "/api": {
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
      },
    },
  }
});
