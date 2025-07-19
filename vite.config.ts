import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js'],  // ✅ force Vite to pre-bundle it
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': '/src', // optional: if you're using path aliases
    },
  },
});
