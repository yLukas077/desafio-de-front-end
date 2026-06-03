/** @jest-environment node */
/**
 * Use-case integration test: real domain, real mapper, mocked HTTP.
 * Asserts the contract between application and infrastructure layers.
 */
import { getWeather } from '@/application/get-weather';
import { CityNotFoundError, WeatherProviderError } from '@/lib/errors';

const OW_CURRENT_FIXTURE = {
  weather: [{ id: 600, main: 'Snow', description: 'light snow', icon: '13d' }],
  main: { temp: -4.2, temp_min: -5.1, temp_max: -3.8, humidity: 95 },
  wind: { speed: 1.69 },
  sys: { sunrise: 1700000000, sunset: 1700040000 },
  timezone: -28800,
  name: 'Vancouver',
};

const OW_FORECAST_FIXTURE = {
  list: Array.from({ length: 8 }, (_, i) => ({
    dt: 1700000000 + i * 3 * 3600,
    main: { temp: -8 + i },
    weather: [{ id: 600, main: 'Snow', icon: '13d' }],
  })),
  city: { timezone: -28800 },
};

beforeAll(() => {
  process.env.OPENWEATHER_API_KEY = 'test-key-12345678';
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockUpstream(
  currentBody: unknown = OW_CURRENT_FIXTURE,
  forecastBody: unknown = OW_FORECAST_FIXTURE,
  status = 200,
) {
  const fn = jest.fn(async (input: unknown) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const body = url.includes('/weather?') ? currentBody : forecastBody;
    return new Response(JSON.stringify(body), { status });
  });
  (global as unknown as { fetch: typeof fetch }).fetch = fn as unknown as typeof fetch;
  return fn;
}

describe('getWeather use case', () => {
  it('returns a mapped Weather record for a valid city', async () => {
    const fetchMock = mockUpstream();
    const result = await getWeather('vancouver');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.city).toBe('Vancouver');
    expect(result.condition).toBe('snow');
    expect(result.conditionLabel).toBe('Snow');
    expect(result.temperature).toBe(-4);
    expect(result.humidity).toBe(95);
    expect(Object.keys(result.periods)).toEqual(['dawn', 'morning', 'afternoon', 'night']);
  });

  it('throws CityNotFoundError for an unknown city id', async () => {
    await expect(getWeather('atlantis')).rejects.toBeInstanceOf(CityNotFoundError);
  });

  it('wraps upstream HTTP failures in WeatherProviderError', async () => {
    (global as unknown as { fetch: typeof fetch }).fetch = (async () =>
      new Response('boom', { status: 503 })) as typeof fetch;
    await expect(getWeather('london')).rejects.toBeInstanceOf(WeatherProviderError);
  });

  it('wraps schema drift in WeatherProviderError, not a raw ZodError', async () => {
    mockUpstream({ unexpected: 'shape' }, { unexpected: 'shape' });
    await expect(getWeather('london')).rejects.toBeInstanceOf(WeatherProviderError);
  });
});
