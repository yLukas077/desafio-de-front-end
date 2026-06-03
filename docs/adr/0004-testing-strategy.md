# 4. Testing strategy

Date: 2025-06-02
Status: accepted

## Levels

| Level         | Tool                   | Scope                                                    |
| ------------- | ---------------------- | -------------------------------------------------------- |
| Unit          | Jest                   | Pure functions in `domain/` and `infrastructure/mapper`. |
| Component     | Jest + Testing Library | Render and a11y semantics of UI components.              |
| Integration   | Jest (Node env)        | Application use case + route handler with fetch mocked.  |
| E2E           | Playwright             | User flows across 4 browser/viewport combos.             |
| Accessibility | Playwright + @axe-core | WCAG 2.1 AA scan of empty state and card.                |

## Principles

- **No snapshot tests on UI.** They go stale, get auto-updated, and stop
  catching the regressions they were meant to catch. We assert on roles,
  labels, and visible text, which doubles as a11y verification.
- **Integration tests own the contract with OpenWeather.** Schema drift on
  the upstream surfaces here as a typed `WeatherProviderError`, not as a
  `NaN` in production.
- **E2E mocks `/api/weather` at the network layer.** This keeps tests fast
  and deterministic; we do not depend on OpenWeather availability or the
  current real weather in Vancouver.
- **Coverage is a smell test, not a target.** We do not gate CI on a
  percentage. We do gate on "every domain function and every route response
  branch is exercised", which we verify by reading the test list.

## Running locally

```bash
npm run test:unit         # fast, runs on every save
npm run test:integration  # ~1s, run before commit
npm run test:e2e          # full Playwright matrix, run before pushing
npm run test:coverage     # report only
```
