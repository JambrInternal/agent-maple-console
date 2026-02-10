import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
import { execSync } from 'child_process';
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  define: {
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(
      (() => {
        try {
          return execSync('git rev-parse --short HEAD').toString().trim();
        } catch (e) {
          return 'unknown';
        }
      })()
    ),
  },
})
