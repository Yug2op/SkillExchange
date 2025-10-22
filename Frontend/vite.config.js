import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    // Enable code splitting and optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // UI component libraries
          ui: ['@headlessui/react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          // State management & data fetching
          state: ['@tanstack/react-query', 'axios'],
          // Utilities
          utils: ['framer-motion', 'date-fns', 'clsx'],
          // Real-time features
          realtime: ['socket.io-client']
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Disable source maps in production for better performance
    sourcemap: false,
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
