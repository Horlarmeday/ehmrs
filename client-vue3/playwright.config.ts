import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:5196', viewport: { width: 1280, height: 900 } },
  webServer: {
    command: 'npx vite --port 5196 --strictPort',
    url: 'http://localhost:5196/kit-harness.html',
    reuseExistingServer: false,
  },
});
