import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // The default 5s timeout is too tight for full-suite parallel runs on a
    // loaded Windows dev box; suites here are pure mocks and never do real I/O.
    testTimeout: 20000,
    hookTimeout: 20000,
    setupFiles: ['./src/test/setup.jsx'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/components/ui/',
        'src/vite-plugins/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
});