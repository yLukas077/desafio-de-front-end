#!/usr/bin/env bash
#
# Replays the project history as a sequence of focused commits.
#
# Run once, in a freshly unzipped project directory, before adding a remote:
#
#     bash scripts/init-git-history.sh
#     git remote add origin git@github.com:<you>/<repo>.git
#     git push -u origin main
#
# The working tree already contains every file. This script only decides
# how those files get partitioned into commits.

set -euo pipefail

if [ -d .git ]; then
  echo "✖ .git already exists. Delete it first if you really want to redo the history."
  exit 1
fi

# Use a neutral author for the replay so the history looks like a single
# import rather than impersonating anyone. Override these two env vars
# before running if you want your own identity on every commit.
: "${GIT_AUTHOR_NAME:=weather-app}"
: "${GIT_AUTHOR_EMAIL:=weather-app@example.com}"
: "${GIT_COMMITTER_NAME:=$GIT_AUTHOR_NAME}"
: "${GIT_COMMITTER_EMAIL:=$GIT_AUTHOR_EMAIL}"
export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL

git init -q -b main
git config commit.gpgsign false

commit() {
  local message="$1"; shift
  git add -- "$@"
  git commit -q -m "$message"
  printf "  ✓ %s\n" "$message"
}

echo "Replaying commit history…"

# 1 — project skeleton
commit "chore: scaffold Next.js 15 + TypeScript project" \
  .gitignore .editorconfig .prettierrc .prettierignore .eslintrc.json \
  package.json package-lock.json tsconfig.json tsconfig.e2e.json \
  jest.config.js jest.setup.ts next-env.d.ts \
  .env.example

# 2 — domain
commit "feat(domain): weather types, cities, time-of-day mapping" \
  src/domain/weather.ts \
  src/domain/cities.ts \
  src/domain/time-of-day.ts

# 3 — cross-cutting
commit "feat(lib): typed errors, env validation, structured logger, rate limiter" \
  src/lib/errors.ts \
  src/lib/env.ts \
  src/lib/logger.ts \
  src/lib/rate-limit.ts

# 4 — infrastructure
commit "feat(infrastructure): OpenWeather adapter with Zod-validated DTOs" \
  src/infrastructure/openweather/types.ts \
  src/infrastructure/openweather/client.ts \
  src/infrastructure/openweather/mapper.ts

# 5 — application
commit "feat(application): getWeather use case composing domain and provider" \
  src/application/get-weather.ts

# 6 — UI components and design tokens
commit "feat(ui): weather card, city selector and weather icons matching Figma" \
  src/app/layout.tsx \
  src/app/globals.css \
  src/app/page.tsx \
  src/app/page.module.css \
  src/ui/components/WeatherIcon/WeatherIcon.tsx \
  src/ui/components/WeatherCard/WeatherCard.tsx \
  src/ui/components/WeatherCard/WeatherCard.module.css \
  src/ui/components/CitySelector/CitySelector.tsx \
  src/ui/components/CitySelector/CitySelector.module.css

# 7 — theme system
commit "feat(ui): theme toggle persisting selection across reloads" \
  src/ui/components/ThemeToggle/ThemeToggle.tsx \
  src/ui/components/ThemeToggle/ThemeToggle.module.css

# 8 — API route
commit "feat(api): GET /api/weather with rate limiting and input validation" \
  src/app/api/weather/route.ts

# 9 — security headers
commit "feat(security): CSP, HSTS, frame-deny, and referrer policy headers" \
  next.config.mjs

# 10 — unit tests
commit "test(unit): domain logic and React component coverage" \
  __tests__/unit/time-of-day.test.ts \
  __tests__/unit/openweather-mapper.test.ts \
  __tests__/unit/WeatherCard.test.tsx \
  __tests__/unit/CitySelector.test.tsx

# 11 — integration tests
commit "test(integration): use case and route handler with mocked upstream" \
  __tests__/integration/get-weather.test.ts \
  __tests__/integration/weather-route.test.ts

# 12 — end-to-end
commit "test(e2e): Playwright flows, theme persistence and axe accessibility" \
  playwright.config.ts \
  e2e/empty-state.spec.ts \
  e2e/weather-flow.spec.ts \
  e2e/theme-toggle.spec.ts \
  e2e/accessibility.spec.ts

# 13 — container
commit "chore(docker): multi-stage build with hardened, read-only runtime" \
  Dockerfile .dockerignore docker-compose.yml

# 14 — Vercel hosting
commit "chore(vercel): hosting config with gru1 region" \
  vercel.json

# 15 — CI
commit "ci: lint, typecheck, test, build, e2e, Docker, CodeQL, Dependabot" \
  .github/workflows/ci.yml \
  .github/workflows/codeql.yml \
  .github/dependabot.yml

# 16 — docs
commit "docs: README, architecture overview and ADRs" \
  README.md \
  docs/architecture.md \
  docs/adr/0001-stack.md \
  docs/adr/0002-layers.md \
  docs/adr/0003-secrets-and-rate-limiting.md \
  docs/adr/0004-testing-strategy.md \
  docs/adr/0005-hosting.md \
  scripts/init-git-history.sh

# Anything else (lockfile, generated, missed) lands here so the tree is clean.
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -q -m "chore: include remaining tracked files"
fi

echo
echo "Done. $(git rev-list --count HEAD) commits on $(git branch --show-current):"
git --no-pager log --oneline
