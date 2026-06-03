import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright runs end-to-end tests against a real Next dev server.
 * Each browser/viewport combination exercises the responsive breakpoints
 * we care about: smartphone, tablet, desktop.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-tablet', use: { ...devices['iPad (gen 7)'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ?? 'placeholder-for-build',
    },
  },
});
