# 2. Layered architecture (domain / application / infrastructure / UI)

Date: 2025-06-02
Status: accepted

## Context

A weather widget is small, but the brief evaluates architectural choices. A
flat `lib/` works for now and rots within a few features. The split below is
the minimum that survives growth without rewriting tests.

## Decision

```
src/
├── domain/         # Types, business rules, no I/O.
├── application/    # Use cases. Compose domain + infrastructure.
├── infrastructure/ # Vendor adapters (OpenWeather, etc.).
├── lib/            # Cross-cutting: env, logger, errors, rate-limit.
└── ui/             # React components, hooks, styles.
```

Routing under `app/` is intentionally thin: parse input, call a use case,
translate errors to HTTP. Zero business logic.

## Rules enforced by code review

1. `domain/` imports nothing from `infrastructure/`, `application/`, `ui/`, or
   any vendor SDK.
2. `application/` imports `domain/` and `infrastructure/` interfaces, never
   their concrete implementations directly (when the project grows, introduce
   ports).
3. `ui/` imports `domain/` types but never `infrastructure/`.
4. `app/` (Next routing) calls `application/`, not `infrastructure/` directly.

## Consequences

- The OpenWeather adapter can be swapped (WeatherAPI, etc.) by writing a new
  module under `infrastructure/` and changing one import in `application/`.
- Unit tests against `domain/` and `application/` run with no Next, no fetch,
  no DOM.
