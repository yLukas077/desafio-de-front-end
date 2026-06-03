/**
 * Domain types — the language the rest of the app speaks.
 *
 * No framework or vendor imports here. If you can't read this file
 * and understand what the product does, the domain isn't clean yet.
 */

export type Period = 'dawn' | 'morning' | 'afternoon' | 'night';

export const PERIODS: readonly Period[] = ['dawn', 'morning', 'afternoon', 'night'] as const;

/** Local clock hours that anchor each period, per the challenge spec. */
export const PERIOD_HOURS: Record<Period, number> = {
  dawn: 3,
  morning: 9,
  afternoon: 15,
  night: 21,
};

export type WeatherCondition =
  | 'clear-day'
  | 'clear-night'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'snow'
  | 'thunderstorm'
  | 'fog'
  | 'unknown';

export type PeriodSnapshot = {
  temperature: number; // ºC, integer
  condition: WeatherCondition;
};

export type Weather = {
  city: string;
  condition: WeatherCondition;
  conditionLabel: string; // "Snow", "Clear"...
  temperature: number; // current ºC
  temperatureMin: number;
  temperatureMax: number;
  periods: Record<Period, PeriodSnapshot>;
  windSpeed: number; // m/s
  sunrise: string; // "HH:MM AM/PM" local
  sunset: string;
  humidity: number; // %
};
