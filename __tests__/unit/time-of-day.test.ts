import { localHour, pickClosestForecast, PERIOD_HOURS } from '@/domain/time-of-day';

describe('localHour', () => {
  it('returns UTC hour when offset is zero', () => {
    // 2024-01-15T12:00:00Z = unix 1705320000
    expect(localHour(1705320000, 0)).toBe(12);
  });

  it('applies positive offset (east of UTC)', () => {
    // 12:00 UTC + 3h = 15:00 local
    expect(localHour(1705320000, 3 * 3600)).toBe(15);
  });

  it('applies negative offset (west of UTC)', () => {
    // 12:00 UTC - 5h = 07:00 local
    expect(localHour(1705320000, -5 * 3600)).toBe(7);
  });

  it('wraps across day boundary', () => {
    // 23:00 UTC + 3h = 02:00 local (next day)
    const ts = 1705359600; // 2024-01-15T23:00:00Z
    expect(localHour(ts, 3 * 3600)).toBe(2);
  });
});

describe('pickClosestForecast', () => {
  const tz = 0; // UTC for simplicity
  // 6 entries every 3h starting at 00:00 UTC on the same day
  const base = 1705276800; // 2024-01-15T00:00:00Z
  const entries = Array.from({ length: 6 }, (_, i) => ({
    dt: base + i * 3 * 3600,
    label: `${i * 3}h`,
  }));

  it('picks the entry closest to dawn (03:00)', () => {
    const picked = pickClosestForecast(entries, PERIOD_HOURS.dawn, tz);
    expect(picked?.label).toBe('3h');
  });

  it('picks the entry closest to morning (09:00)', () => {
    const picked = pickClosestForecast(entries, PERIOD_HOURS.morning, tz);
    expect(picked?.label).toBe('9h');
  });

  it('picks the entry closest to afternoon (15:00)', () => {
    const picked = pickClosestForecast(entries, PERIOD_HOURS.afternoon, tz);
    expect(picked?.label).toBe('15h');
  });

  it('picks the entry closest to night (21:00) — circular distance on clock', () => {
    // entries go 0..15h; night=21 is closer to 15h (diff 6) than to 0h (diff 3 wrap)
    // wait — circular distance: |21-0|=21, 24-21=3. |21-15|=6, 24-6=18. min=3 vs 6 → 0h wins.
    const picked = pickClosestForecast(entries, PERIOD_HOURS.night, tz);
    expect(picked?.label).toBe('0h');
  });

  it('returns undefined for empty input', () => {
    expect(pickClosestForecast([], 9, 0)).toBeUndefined();
  });
});
