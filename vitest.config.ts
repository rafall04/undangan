import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// Vitest — test logika inti (pure). Alias @/ → root proyek.
export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
