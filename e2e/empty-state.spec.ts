import { test, expect } from '@playwright/test';

test.describe('Empty state — city selector', () => {
  test('renders the six required cities', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Weather' })).toBeVisible();
    await expect(page.getByText('Select a city')).toBeVisible();

    for (const name of ['Dallol', 'Fairbanks', 'London', 'Recife', 'Vancouver', 'Yakutsk']) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  test('city buttons are keyboard reachable', async ({ page }) => {
    await page.goto('/');
    // Tab past theme toggle group first
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    expect(['Dallol', 'Fairbanks', 'London', 'Recife', 'Vancouver', 'Yakutsk']).toContain(focused);
  });
});
