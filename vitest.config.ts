/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: process.cwd(),
    passWithNoTests: true, // so we can confirm the test script is working with no tests yet
    include: ['./**/*.test.ts', './**/*.test.tsx'],
    environment: 'happy-dom',
    setupFiles: [],
    clearMocks: true,
    poolOptions: {
      isolate: false,
      threads: {
        singleThread: true,
      },
      forks: {
        isolate: false,
      },
    },
  },
})
