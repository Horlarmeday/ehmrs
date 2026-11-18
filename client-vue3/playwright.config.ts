import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:5196' },
  projects: [
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'tablet-portrait',
      use: { ...devices['Galaxy Tab S9'] },
    },
    {
      name: 'tablet-landscape',
      use: { ...devices['Galaxy Tab S9 landscape'] },
    },
  ],
  webServer: {
    command: 'npx vite --port 5196 --strictPort',
    url: 'http://localhost:5196/kit-harness.html',
    reuseExistingServer: false,
  },
});
