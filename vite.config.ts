import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion', 'gsap', '@gsap/react'],
          'particles-vendor': ['@tsparticles/react', '@tsparticles/slim', '@tsparticles/engine'],
          'utils-vendor': ['lenis', '@react-spring/web', 'clsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

