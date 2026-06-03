# Weather

Single-page weather app for six cities, built for the TDS front-end challenge.

## Stack

Next.js 15 · React 18 · TypeScript · CSS Modules · Zod · Jest · Playwright.
Node 20+ required.

## Running it

```bash
cp .env.example .env        # add your OPENWEATHER_API_KEY
npm install
npm run dev                 # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

Docker:

```bash
cp .env.example .env        # add your OPENWEATHER_API_KEY first
docker compose up --build
```

The compose file refuses to start without `OPENWEATHER_API_KEY` set. The
container runs as non-root, with a read-only root filesystem, all Linux
capabilities dropped, and `no-new-privileges` enabled.

## Deploying to Vercel

Two ways. Pick one.

**Via GitHub integration (recommended)**

1. Push the repo to GitHub (see `scripts/init-git-history.sh`).
2. On [vercel.com](https://vercel.com), import the repository.
3. In the project's *Settings → Environment Variables*, add
   `OPENWEATHER_API_KEY` for the *Production* and *Preview* environments.
4. Optional: adjust `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`, `LOG_LEVEL`.
5. Trigger a deploy. Vercel picks up [`vercel.json`](./vercel.json),
   detects Next.js, and applies the security headers from
   [`next.config.mjs`](./next.config.mjs).

Every push to `main` ships to production. Every PR gets a preview URL.

**Via Vercel CLI**

```bash
npm i -g vercel
vercel link              # one-time, pairs the directory with a Vercel project
vercel env add OPENWEATHER_API_KEY production
vercel --prod
```

**Region.** [`vercel.json`](./vercel.json) pins `gru1` (São Paulo). Change
or remove the `regions` field for a different geography. See ADR 5 for the
reasoning and the Vercel-specific caveats.

## Tests

```bash
npm run test:unit           # pure logic + components, ~1s
npm run test:integration    # use case + route handler with fetch mocked
npm run test:e2e            # Playwright across Chromium, Firefox, WebKit, mobile
npm run test:coverage       # all Jest tests + coverage report
```

## Project layout

```
src/
├── domain/           # types and rules — no I/O, no framework
├── application/      # use cases composed from domain + infrastructure
├── infrastructure/   # vendor adapters (OpenWeather)
├── lib/              # cross-cutting: env, errors, logger, rate-limit
├── ui/               # React components and hooks
└── app/              # Next routing — thin transport layer
```

Reasoning behind the split: [`docs/adr/0002-layers.md`](docs/adr/0002-layers.md).

## Key design decisions

- **API key never reaches the client.** It lives server-side only; route handler
  proxies the call. Detail: [`docs/adr/0003-secrets-and-rate-limiting.md`](docs/adr/0003-secrets-and-rate-limiting.md).
- **Schema validation at the boundary.** Zod parses OpenWeather responses;
  upstream drift surfaces as a typed error, not a NaN.
- **Rate limited.** 30 req/min/IP by default. Returns 429 with `Retry-After`.
- **Cached.** Next's data cache holds upstream responses for 10 minutes per
  coordinate pair. CDN-level cache for client responses: `s-maxage=600`.
- **Security headers.** CSP, HSTS, frame-deny, no-sniff, referrer policy applied
  globally in [`next.config.mjs`](next.config.mjs).
- **Testing pyramid honest.** Unit > integration > e2e by count. Each level
  proves something the others can't: [`docs/adr/0004-testing-strategy.md`](docs/adr/0004-testing-strategy.md).

## Map of the design system → code

Tokens in `src/app/globals.css` mirror the Figma style guide:

| Figma                       | CSS variable     | Value     |
| --------------------------- | ---------------- | --------- |
| background / gray           | `--bg-gray`      | `#CACACA` |
| background / black          | `--bg-black`     | `#0F0F0F` |
| background / blue           | `--bg-blue`      | `#2CAEFF` |
| text / dark                 | `--text-dark`    | `#0F0F0F` |
| text / white                | `--text-white`   | `#F9F9F9` |
| stroke                      | `--stroke`       | `#DFE4EA` |
| Type scale (48, 1.25 ratio) | `--fs-48`..`-16` | 48..16 px |

Theme switching uses `[data-theme="dark|blue"]` on `<html>` and overrides the
`--page-bg` / `--page-fg` pair. Three swatches in the top-right; choice persists
in `localStorage`.

## Period mapping (Dawn / Morning / Afternoon / Night)

The brief defines these as 03:00, 09:00, 15:00, 21:00 local time. OpenWeather's
free tier returns forecasts every 3 hours in UTC. `src/domain/time-of-day.ts`
applies the city's `timezone` offset and picks the closest entry for each
target hour using circular distance on a 24-hour clock.

## Cities

| Id          | Country         |
| ----------- | --------------- |
| `dallol`    | Ethiopia (ET)\* |
| `fairbanks` | United States   |
| `london`    | United Kingdom  |
| `recife`    | Brazil          |
| `vancouver` | Canada          |
| `yakutsk`   | Russia          |

\* The brief says "Dallol (NG)". Dallol is in the Afar region of Ethiopia, not
Nigeria. The list uses the real coordinates; the id matches the brief spelling.

## Continuous integration

GitHub Actions runs on every push and PR: lint, typecheck, prettier check, unit

- integration tests with coverage, production build, Playwright e2e, Docker
  build. CodeQL runs weekly. Dependabot opens grouped weekly PRs for npm,
  actions, and Docker.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system overview and data flow
- [`docs/adr/`](docs/adr/) — architecture decision records
