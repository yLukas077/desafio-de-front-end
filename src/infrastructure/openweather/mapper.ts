import type { City } from '@/domain/cities';
import type { Weather, WeatherCondition, Period, PeriodSnapshot } from '@/domain/weather';
import { PERIODS, PERIOD_HOURS } from '@/domain/weather';
import { pickClosestForecast } from '@/domain/time-of-day';
import type { OWResult } from './types';

/**
 * OpenWeather encodes the condition in a numeric ID (200..804). We collapse
 * those buckets into the eight icons the design system ships with.
 * See https://openweathermap.org/weather-conditions for the original taxonomy.
 */
export function mapCondition(id: number, icon?: string): WeatherCondition {
  const isNight = icon?.endsWith('n');
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'fog';
  if (id === 800) return isNight ? 'clear-night' : 'clear-day';
  if (id > 800) return 'clouds';
  return 'unknown';
}

const LABELS: Record<WeatherCondition, string> = {
  'clear-day': 'Clear',
  'clear-night': 'Clear',
  clouds: 'Clouds',
  rain: 'Rain',
  drizzle: 'Drizzle',
  snow: 'Snow',
  thunderstorm: 'Thunderstorm',
  fog: 'Fog',
  unknown: 'Unknown',
};

export function conditionLabel(c: WeatherCondition): string {
  return LABELS[c];
}

/** Formats a unix timestamp as "HH:MM AM/PM" in the city's local time. */
export function formatLocalTime(unixSeconds: number, tzOffsetSeconds: number): string {
  const d = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const meridiem = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
}

export function mapToWeather(city: City, data: OWResult): Weather {
  const { current, forecast } = data;
  const tz = current.timezone;

  const periods = {} as Record<Period, PeriodSnapshot>;
  for (const p of PERIODS) {
    const entry = pickClosestForecast(forecast.list, PERIOD_HOURS[p], tz);
    const temp = entry ? Math.round(entry.main.temp) : Math.round(current.main.temp);
    const src = entry?.weather[0] ?? current.weather[0];
    periods[p] = {
      temperature: temp,
      condition: mapCondition(src.id, src.icon),
    };
  }

  const condition = mapCondition(current.weather[0].id, current.weather[0].icon);

  return {
    city: city.name,
    condition,
    conditionLabel: conditionLabel(condition),
    temperature: Math.round(current.main.temp),
    temperatureMin: Math.round(current.main.temp_min),
    temperatureMax: Math.round(current.main.temp_max),
    periods,
    windSpeed: current.wind.speed,
    sunrise: formatLocalTime(current.sys.sunrise, tz),
    sunset: formatLocalTime(current.sys.sunset, tz),
    humidity: current.main.humidity,
  };
}
