import { test, expect } from '@playwright/test';

const WEATHER_RESPONSE = {
  city: 'Vancouver',
  condition: 'snow' as const,
  conditionLabel: 'Snow',
  temperature: -4,
  temperatureMin: -5,
  temperatureMax: -4,
  periods: {
    dawn: { temperature: -8, condition: 'clouds' as const },
    morning: { temperature: -8, condition: 'clear-day' as const },
    afternoon: { temperature: -4, condition: 'clouds' as const },
    night: { temperature: -1, condition: 'clear-night' as const },
  },
  windSpeed: 1.69,
  sunrise: '12:38 PM',
  sunset: '10:13 PM',
  humidity: 95,
};

test.describe('Weather selection flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/weather**', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(WEATHER_RESPONSE) }),
    );
  });

  test('selecting a city shows its weather card', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Vancouver' }).click();

    await expect(page.getByRole('heading', { name: 'Vancouver' })).toBeVisible();
    await expect(page.getByText('Snow')).toBeVisible();
    await expect(page.getByText('-4', { exact: true })).toBeVisible();
    await expect(page.getByText('1.69 m/s')).toBeVisible();
    await expect(page.getByText('95%')).toBeVisible();
  });

  test('all four periods are shown with labels and temperatures', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Vancouver' }).click();

    for (const label of ['Dawn', 'Morning', 'Afternoon', 'Night']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('back button returns to the city selector', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Vancouver' }).click();
    await expect(page.getByRole('heading', { name: 'Vancouver' })).toBeVisible();

    await page.getByRole('button', { name: /choose another city/i }).click();
    await expect(page.getByRole('heading', { name: 'Weather' })).toBeVisible();
  });

  test('shows an error when the API fails', async ({ page }) => {
    await page.route('**/api/weather**', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'boom' }) }),
    );
    await page.goto('/');
    await page.getByRole('button', { name: 'Vancouver' }).click();

    await expect(page.getByRole('alert').filter({ hasText: /could not load/i })).toBeVisible();
  });
});
