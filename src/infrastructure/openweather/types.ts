import { z } from 'zod';

/**
 * DTO schemas for the OpenWeather endpoints we use. Anything we don't
 * consume is omitted — narrower schemas mean tighter contract tests and
 * smaller surface for upstream schema drift to break us.
 *
 * We use `.passthrough()` so extra fields don't cause validation failures;
 * we just don't depend on them.
 */

const CurrentWeather = z.object({
  weather: z
    .array(
      z.object({
        id: z.number(),
        main: z.string(),
        description: z.string(),
        icon: z.string(),
      }),
    )
    .min(1),
  main: z.object({
    temp: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({ speed: z.number() }),
  sys: z.object({ sunrise: z.number(), sunset: z.number() }),
  timezone: z.number(),
  name: z.string(),
});

const ForecastEntry = z.object({
  dt: z.number(),
  main: z.object({ temp: z.number() }),
  weather: z.array(z.object({ id: z.number(), main: z.string(), icon: z.string() })).min(1),
});

const Forecast = z.object({
  list: z.array(ForecastEntry),
  city: z.object({ timezone: z.number() }),
});

export const OWCurrentSchema = CurrentWeather;
export const OWForecastSchema = Forecast;

export type OWCurrent = z.infer<typeof CurrentWeather>;
export type OWForecast = z.infer<typeof Forecast>;
export type OWForecastEntry = z.infer<typeof ForecastEntry>;

export type OWResult = { current: OWCurrent; forecast: OWForecast };
