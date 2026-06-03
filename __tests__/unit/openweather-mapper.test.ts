import { mapCondition, conditionLabel, formatLocalTime } from '@/infrastructure/openweather/mapper';

describe('mapCondition', () => {
  it('maps thunderstorm range', () => {
    expect(mapCondition(200)).toBe('thunderstorm');
    expect(mapCondition(232)).toBe('thunderstorm');
  });
  it('maps drizzle range', () => {
    expect(mapCondition(301)).toBe('drizzle');
  });
  it('maps rain range', () => {
    expect(mapCondition(500)).toBe('rain');
  });
  it('maps snow range', () => {
    expect(mapCondition(601)).toBe('snow');
  });
  it('maps atmosphere/fog range', () => {
    expect(mapCondition(741)).toBe('fog');
  });
  it('distinguishes clear day vs night by icon code', () => {
    expect(mapCondition(800, '01d')).toBe('clear-day');
    expect(mapCondition(800, '01n')).toBe('clear-night');
  });
  it('maps clouds', () => {
    expect(mapCondition(803)).toBe('clouds');
  });
});

describe('conditionLabel', () => {
  it('returns "Clear" for both clear-day and clear-night', () => {
    expect(conditionLabel('clear-day')).toBe('Clear');
    expect(conditionLabel('clear-night')).toBe('Clear');
  });
  it('returns "Snow" for snow', () => {
    expect(conditionLabel('snow')).toBe('Snow');
  });
});

describe('formatLocalTime', () => {
  it('formats noon UTC with zero offset as 12:00 PM', () => {
    // 2024-01-15T12:00:00Z
    expect(formatLocalTime(1705320000, 0)).toBe('12:00 PM');
  });
  it('formats midnight UTC with zero offset as 12:00 AM', () => {
    // 2024-01-15T00:00:00Z
    expect(formatLocalTime(1705276800, 0)).toBe('12:00 AM');
  });
  it('applies timezone offset correctly', () => {
    // We want local time "04:21 AM" with UTC+1 offset, so UTC time is 03:21.
    // 2024-01-15T03:21:00Z = 1705276800 + 3*3600 + 21*60 = 1705288860
    expect(formatLocalTime(1705288860, 3600)).toBe('04:21 AM');
  });
});
