# 3. API key handling and rate limiting

Date: 2025-06-02
Status: accepted

## Context

The OpenWeather free tier allows 60 calls per minute and 1M per month per key.
A leaked key means depleted quota or a billing surprise. A naive proxy with
no rate limit is itself a DoS vector against the upstream and against our own
quota.

## Decision

1. **Server-side only.** The key lives in `OPENWEATHER_API_KEY`, validated by
   Zod at startup (`src/lib/env.ts`). It is read only inside
   `infrastructure/openweather/client.ts`, which runs in a route handler. It
   never appears in any module that the client bundle imports.

2. **Per-client rate limit.** `src/lib/rate-limit.ts` implements an in-memory
   sliding window keyed by `X-Forwarded-For`. Default: 30 req/min/IP. Tunable
   via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`. For horizontal scaling,
   swap the Map for Redis without changing the interface.

3. **Upstream cache.** Next's `fetch` cache holds OpenWeather responses for
   10 minutes per coordinate pair. A burst of users requesting the same city
   results in one upstream call.

## What this does not protect against

- Distributed abuse from many IPs. Mitigation belongs upstream (Cloudflare,
  WAF, edge rate limit).
- Quota exhaustion from legitimate organic traffic if the cache TTL is too
  short. 10 minutes is a deliberate trade between freshness and cost.
- **Serverless cold starts.** On Vercel and similar platforms, each function
  instance has its own memory. The configured limit applies per-instance,
  not globally. For real production scale, replace the `Map` in
  `createRateLimiter` with Vercel KV / Upstash Redis — the interface is the
  same, only the storage changes.

## Operational notes

- A 429 response includes `Retry-After` (seconds) and the standard
  `X-RateLimit-*` headers. Clients should respect these instead of polling.
