import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('maplibre-gl') || id.includes('firebase') || id.includes('xlsx')) {
            return 'map-vendor';
          }
        },
      },
    },
  },
});
