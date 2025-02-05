import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tsconfigPaths(), react()],
  define: {
    global: 'globalThis',
  },
})
