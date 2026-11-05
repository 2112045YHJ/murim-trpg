import { defineConfig } from 'vitest/config';

export default defineConfig({
  // GitHub Pages 같은 하위 경로에도 올릴 수 있도록 상대 경로로 빌드
  base: './',
  server: { port: 5173 },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
