import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  plugins: [
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  resolve: {
    alias: {
      '/src': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: process.env.HOST || '0.0.0.0', // Default to network access
    port: process.env.FRONTEND_PORT || 8000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://${process.env.HOST || '0.0.0.0'}:${process.env.BACKEND_PORT || 8001}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'public/index.html',
      },
    },
  },
  css: {
    postcss: false, // Disable PostCSS since we're using Tailwind Vite plugin
  },
});
