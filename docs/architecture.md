# Architecture

## Request flow

```
                ┌──────────────────────────────────────────────┐
                │ Browser                                       │
                │   page.tsx → fetch('/api/weather?city=...')   │
                └────────────────────┬─────────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────────┐
                │ app/api/weather/route.ts (transport)          │
                │   - rate limit by X-Forwarded-For             │
                │   - input validation (regex on city id)       │
                │   - DomainError → HTTP status mapping         │
                └────────────────────┬─────────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────────┐
                │ application/get-weather.ts (use case)         │
                │   findCity() ─▶ provider() ─▶ mapper()        │
                └─────────┬────────────────────┬───────────────┘
                          │                    │
                          ▼                    ▼
              ┌──────────────────┐  ┌──────────────────────────┐
              │ domain/cities    │  │ infrastructure/openweather│
              │ domain/weather   │  │   client.ts (HTTP+Zod)    │
              │ domain/time-of-  │  │   mapper.ts (DTO→domain)  │
              │   day            │  │   types.ts (Zod schemas)  │
              └──────────────────┘  └────────────┬─────────────┘
                                                  │
                                                  ▼
                                       OpenWeatherMap API
                                       (cached by Next 10 min)
```

## Layers, in dependency order

**`domain/`** — types and pure functions. Knows nothing about HTTP, React,
Next, or OpenWeather. If this layer compiles, the business rules are intact.
This is also where unit tests are cheapest.

**`infrastructure/`** — every external boundary. One subfolder per vendor.
Today only `openweather/`. Adding WeatherAPI as a fallback would mean a
sibling folder and a one-line change in the use case to switch providers.

**`application/`** — orchestrates domain and infrastructure to satisfy a
use case. One function per use case. Currently: `getWeather(cityId)`. Future
use cases (favorites, alerts) get their own function here.

**`lib/`** — cross-cutting concerns: env validation, errors, logger, rate
limit. Imported by infrastructure and application; never imports them.

**`ui/`** — React. Components know domain types but not how data was fetched.

**`app/`** — Next.js routing. Treated as a transport layer over use cases:
HTTP in, HTTP out, zero business logic.

## Error handling

All errors flow through the typed hierarchy in `src/lib/errors.ts`. Each
subclass declares its `status` and `code`. The route handler matches on
`instanceof DomainError`; anything else becomes a 500 with a sanitised
message and a structured log entry.

| Class                  | HTTP | When                                |
| ---------------------- | ---- | ----------------------------------- |
| `InvalidRequestError`  | 400  | Missing or malformed `?city=`       |
| `CityNotFoundError`    | 404  | City not in the allowlist           |
| `RateLimitedError`     | 429  | Per-IP window exhausted             |
| `ConfigurationError`   | 500  | Env validation failed at startup    |
| `WeatherProviderError` | 502  | Upstream HTTP error or schema drift |

## Caching

Two layers, both opt-in:

1. **Server-side data cache** (Next `fetch` with `next.revalidate: 600`).
   Coordinate-pair-keyed. A burst of requests for the same city hits the
   upstream once per 10 minutes.

2. **HTTP cache headers** on the route response:
   `Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=300`.
   Browsers cache for 5 min; intermediaries for 10 min; both serve stale for
   another 5 min while revalidating.

## Configuration

`src/lib/env.ts` validates `process.env` with Zod at module load. A typo in
`.env` fails at boot with a list of the issues, not at the first request with
a `Cannot read property of undefined`.

## Logging

`src/lib/logger.ts` emits JSON in production and human-readable lines in
development. No vendor lock-in; swap for pino without changing call sites.
Log level via `LOG_LEVEL=debug|info|warn|error` (default `info`).

## Threat model summary

| Vector                             | Mitigation                                               |
| ---------------------------------- | -------------------------------------------------------- |
| API key exfiltration via client    | Key read only inside route handler module                |
| Open redirect / SSRF via `city`    | Allowlist + regex `^[a-z0-9-]{1,32}$`                    |
| XSS via injected weather data      | All values render as text; no `dangerouslySetInnerHTML`  |
| Clickjacking                       | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`    |
| MITM downgrade                     | HSTS preload, includeSubDomains                          |
| Inline script injection            | CSP `script-src 'self'`                                  |
| Quota exhaustion / DoS on upstream | Per-IP rate limit + 10-min upstream cache                |
| Schema drift breaking the app      | Zod parse at the boundary → typed `WeatherProviderError` |
| Dependency vulnerabilities         | Dependabot weekly + CodeQL                               |

What's deliberately not in scope: distributed-IP abuse (needs WAF/edge), bot
detection, account-level auth (the app is anonymous).
