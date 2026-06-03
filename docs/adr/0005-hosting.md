# 5. Hosting: Vercel as primary, Docker as portable fallback

Date: 2025-06-02
Status: accepted

## Context

The app must run somewhere a reviewer can click. Three realistic options:

1. **Vercel** — the platform Next.js is built around. Zero-config for our
   stack, free tier covers the demo traffic, regional deployment near our
   target users.
2. **Self-hosted container** — the Docker setup we already have. Works on
   any orchestrator, but requires us to provision and run the host.
3. **Static export** — not viable. The API key must stay server-side, so
   we need a function runtime, not a static bucket.

## Decision

Primary deploy target: **Vercel**, via the GitHub integration on the `main`
branch. Every PR gets a preview URL automatically. The Docker image stays
as a portable artefact for environments where Vercel isn't an option (air-
gapped, on-prem, vendor lock-in concerns).

The same source builds on both. `output: 'standalone'` in `next.config.mjs`
is consumed by the Dockerfile and ignored by Vercel — no fork in the build.

## Consequences

- **Rate limiter changes meaning.** On Vercel, each serverless function
  instance has its own memory. A cold-start spawns a fresh limiter; an
  attacker bouncing across instances sees a higher effective limit than the
  configured value. For Hobby-tier demo traffic this is acceptable. For
  production scale, see ADR 3 — swap the limiter's `Map` for Vercel KV or
  Upstash Redis without changing the interface.
- **Caching improves.** Vercel's Data Cache replaces the local tmpfs cache
  we use in Docker, distributed across the edge network.
- **Region.** `vercel.json` pins `gru1` (São Paulo). Closest region to our
  audience; remove or change to `iad1` (US East) for global traffic.
- **Secrets management.** `OPENWEATHER_API_KEY` lives in Vercel's encrypted
  environment variables, scoped per environment (production / preview /
  development). Never committed.
- **No `vercel-build` script needed.** Standard `next build` is what Vercel
  invokes; our `next.config.mjs` headers ship to Vercel's edge proxy.
