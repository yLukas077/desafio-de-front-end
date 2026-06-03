import { PERIOD_HOURS, PERIODS, type Period } from './weather';

export { PERIOD_HOURS, PERIODS };
export type { Period };

/**
 * Convert a UTC unix timestamp to the local hour (0–23) of a place
 * whose offset from UTC is given in seconds (the format OpenWeather uses).
 */
export function localHour(unixSeconds: number, tzOffsetSeconds: number): number {
  const local = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  return local.getUTCHours();
}

/**
 * From a list of timestamped forecast entries, return the one whose local
 * hour is closest to `targetHour`. Uses circular distance on a 24-hour clock,
 * so 23h and 1h are 2h apart, not 22h.
 */
export function pickClosestForecast<T extends { dt: number }>(
  entries: readonly T[],
  targetHour: number,
  tzOffsetSeconds: number,
): T | undefined {
  if (entries.length === 0) return undefined;
  let best: T | undefined;
  let bestDiff = Infinity;
  for (const entry of entries) {
    const h = localHour(entry.dt, tzOffsetSeconds);
    const raw = Math.abs(h - targetHour);
    const diff = Math.min(raw, 24 - raw);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best;
}
