/** @jest-environment node */
/**
 * Route handler integration test. Exercises validation, rate limiting,
 * error mapping, and response headers.
 */
import { NextRequest } from 'next/server';

const OW_FIXTURE = {
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  main: { temp: 13, temp_min: 11, temp_max: 14, humidity: 45 },
  wind: { speed: 1.92 },
  sys: { sunrise: 1700000000, sunset: 1700040000 },
  timezone: 3600,
  name: 'Madrid',
};
const FORECAST_FIXTURE = {
  list: Array.from({ length: 8 }, (_, i) => ({
    dt: 1700000000 + i * 3 * 3600,
    main: { temp: 10 + i },
    weather: [{ id: 800, main: 'Clear', icon: '01d' }],
  })),
  city: { timezone: 3600 },
};

beforeAll(() => {
  process.env.OPENWEATHER_API_KEY = 'test-key-12345678';
  process.env.RATE_LIMIT_MAX = '3';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
});

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function makeReq(path: string, ip = '1.2.3.4'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    headers: { 'x-forwarded-for': ip },
  });
}

function mockUpstreamOK() {
  (global as unknown as { fetch: typeof fetch }).fetch = (async (input: unknown) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const body = url.includes('/weather?') ? OW_FIXTURE : FORECAST_FIXTURE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
}

describe('GET /api/weather', () => {
  it('returns 200 with weather payload and cache headers', async () => {
    mockUpstreamOK();
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(makeReq('/api/weather?city=london'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ city: 'London', conditionLabel: 'Clear' });
    expect(res.headers.get('Cache-Control')).toContain('max-age=300');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('3');
  });

  it('returns 400 when the city parameter is missing', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(makeReq('/api/weather'));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_REQUEST');
  });

  it('returns 400 when the city parameter has illegal characters', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(makeReq('/api/weather?city=../etc/passwd'));
    expect(res.status).toBe(400);
  });

  it('returns 404 for a city outside the allowlist', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(makeReq('/api/weather?city=atlantis'));
    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('CITY_NOT_FOUND');
  });

  it('returns 502 when upstream fails', async () => {
    (global as unknown as { fetch: typeof fetch }).fetch = (async () =>
      new Response('boom', { status: 500 })) as typeof fetch;
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(makeReq('/api/weather?city=london'));
    expect(res.status).toBe(502);
  });

  it('enforces the rate limit per client and surfaces Retry-After', async () => {
    mockUpstreamOK();
    const { GET } = await import('@/app/api/weather/route');
    const ip = '9.9.9.9';
    for (let i = 0; i < 3; i++) {
      const ok = await GET(makeReq('/api/weather?city=london', ip));
      expect(ok.status).toBe(200);
    }
    const limited = await GET(makeReq('/api/weather?city=london', ip));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBeTruthy();
  });
});
