import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WEATHER_RESPONSE = {
  city: 'Vancouver',
  condition: 'snow',
  conditionLabel: 'Snow',
  temperature: -4,
  temperatureMin: -5,
  temperatureMax: -4,
  periods: {
    dawn: { temperature: -8, condition: 'clouds' },
    morning: { temperature: -8, condition: 'clear-day' },
    afternoon: { temperature: -4, condition: 'clouds' },
    night: { temperature: -1, condition: 'clear-night' },
  },
  windSpeed: 1.69,
  sunrise: '12:38 PM',
  sunset: '10:13 PM',
  humidity: 95,
};

/**
 * @axe-core/playwright's Page type lags slightly behind @playwright/test's.
 * Wrapping the constructor centralises the cast so test bodies stay readable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axe = (page: unknown) => new AxeBuilder({ page: page as any });

test.describe('Accessibility', () => {
  test('empty state has no detectable WCAG violations', async ({ page }) => {
    await page.goto('/');
    const results = await axe(page).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });

  test('weather card has no detectable WCAG violations', async ({ page }) => {
    await page.route('**/api/weather**', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(WEATHER_RESPONSE) }),
    );
    await page.goto('/');
    await page.getByRole('button', { name: 'Vancouver' }).click();
    await page.waitForSelector('h1');

    const results = await axe(page).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});
