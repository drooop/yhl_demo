import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
  },
  coverage: {
    reporter: ['text'],
    include: ['src/stores/session.ts'],
    all: false,
  },
});
