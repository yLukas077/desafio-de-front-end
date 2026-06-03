import { env } from '@/lib/env';
import { WeatherProviderError } from '@/lib/errors';
import type { City } from '@/domain/cities';
import { OWCurrentSchema, OWForecastSchema, type OWResult } from './types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Fetches both current weather and 5-day forecast in parallel.
 *
 * Caching: `next.revalidate = 600` lets Next's data cache serve the
 * same coordinates for 10 minutes regardless of which user requested
 * them — a single warm cache covers all visitors.
 *
 * Validation: Zod parses the responses so we crash with a useful error
 * if OpenWeather changes its schema, rather than producing NaN downstream.
 */
export async function fetchWeatherFromProvider(city: City): Promise<OWResult> {
  const params = new URLSearchParams({
    lat: String(city.lat),
    lon: String(city.lon),
    units: 'metric',
    appid: env.OPENWEATHER_API_KEY,
  });

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?${params}`, {
        signal: ctrl.signal,
        next: { revalidate: 600 },
      }),
      fetch(`${BASE_URL}/forecast?${params}`, {
        signal: ctrl.signal,
        next: { revalidate: 600 },
      }),
    ]);

    if (!currentRes.ok) {
      throw new WeatherProviderError(`current weather: ${currentRes.status}`);
    }
    if (!forecastRes.ok) {
      throw new WeatherProviderError(`forecast: ${forecastRes.status}`);
    }

    const [currentRaw, forecastRaw] = await Promise.all([currentRes.json(), forecastRes.json()]);

    const current = OWCurrentSchema.parse(currentRaw);
    const forecast = OWForecastSchema.parse(forecastRaw);
    return { current, forecast };
  } catch (err) {
    if (err instanceof WeatherProviderError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new WeatherProviderError('upstream request timed out', err);
    }
    throw new WeatherProviderError(
      err instanceof Error ? err.message : 'unknown upstream error',
      err,
    );
  } finally {
    clearTimeout(timeout);
  }
}
