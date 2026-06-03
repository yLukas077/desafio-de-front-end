import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('switches between the three themes and persists across reloads', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // Default is light — no data-theme attribute
    await expect(html).not.toHaveAttribute('data-theme', /.*/);

    await page.getByRole('radio', { name: /dark theme/i }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('radio', { name: /blue theme/i }).click();
    await expect(html).toHaveAttribute('data-theme', 'blue');

    await page.getByRole('radio', { name: /gray theme/i }).click();
    await expect(html).not.toHaveAttribute('data-theme', /.*/);
  });
});
