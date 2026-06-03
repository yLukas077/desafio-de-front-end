import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/application/get-weather';
import { createRateLimiter, type RateLimiter } from '@/lib/rate-limit';
import { DomainError, InvalidRequestError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { env } from '@/lib/env';

/**
 * Lazy singleton. The limiter is built on first request rather than at
 * module load, so `next build` doesn't need OPENWEATHER_API_KEY in scope.
 * Env is still validated on the first real request, which is when we
 * actually need it.
 */
let _limiter: RateLimiter | undefined;
function limiter(): RateLimiter {
  if (!_limiter) {
    _limiter = createRateLimiter({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    });
  }
  return _limiter;
}

function clientKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
}

export async function GET(req: NextRequest) {
  const key = clientKey(req);
  const rl = limiter().check(key);
  const rlHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(env.RATE_LIMIT_MAX),
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
  };

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: { ...rlHeaders, 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const cityId = req.nextUrl.searchParams.get('city');
    if (!cityId || !/^[a-z0-9-]{1,32}$/.test(cityId)) {
      throw new InvalidRequestError('Missing or malformed `city` query parameter');
    }

    const data = await getWeather(cityId);

    return NextResponse.json(data, {
      headers: {
        ...rlHeaders,
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    if (err instanceof DomainError) {
      log.warn({ code: err.code, msg: err.message }, 'request rejected');
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status, headers: rlHeaders },
      );
    }
    log.error({ err: err instanceof Error ? err.message : String(err) }, 'unexpected error');
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500, headers: rlHeaders },
    );
  }
}
