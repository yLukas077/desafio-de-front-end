import { findCity } from '@/domain/cities';
import type { Weather } from '@/domain/weather';
import { CityNotFoundError } from '@/lib/errors';
import { fetchWeatherFromProvider } from '@/infrastructure/openweather/client';
import { mapToWeather } from '@/infrastructure/openweather/mapper';

/**
 * The single use case the app exposes: given a city id from the allowlist,
 * return its current weather and time-of-day forecast.
 *
 * Kept deliberately small. If we add favorites, history, alerts, etc.,
 * each gets its own function here — the route handler never calls
 * infrastructure directly.
 */
export async function getWeather(cityId: string): Promise<Weather> {
  const city = findCity(cityId);
  if (!city) throw new CityNotFoundError(cityId);

  const data = await fetchWeatherFromProvider(city);
  return mapToWeather(city, data);
}
