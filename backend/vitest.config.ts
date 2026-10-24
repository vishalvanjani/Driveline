import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // All tests share one SQLite file, so run files sequentially.
    fileParallelism: false,
    coverage: { provider: 'v8', include: ['src/**'], exclude: ['src/server.ts'] },
  },
});
