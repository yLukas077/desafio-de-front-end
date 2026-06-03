# 1. Stack: Next.js + TypeScript

Date: 2025-06-02
Status: accepted

## Context

The brief allows React with Next.js, React with Vite, Vue, or Angular. We need
SSR-capable infrastructure to keep the OpenWeather API key server-side, and a
small bundle on the client. The project is a single-page interactive UI with one
backend call.

## Decision

Next.js 15 (App Router) + TypeScript + CSS Modules.

- **Next over Vite**: route handlers run on the same host as the UI, so the API
  key never leaves the server. Vite would need a separate Node service.
- **App Router over Pages Router**: streaming, native `fetch` cache, simpler
  data-flow primitives.
- **CSS Modules over Tailwind**: the design has 6 specific colors and a 6-step
  type scale. Hardcoding those as CSS custom properties tracks the Figma 1:1
  and the file is shorter than a Tailwind config with the same constraints.

## Consequences

- Vendor lock-in to Vercel's primitives (`fetch` revalidate, `next/font`,
  route handlers). Migration off Next would require rewriting the cache layer
  and the headers config.
- CSS Modules ship more CSS than Tailwind for the same UI, but the design has
  a small surface so the difference is negligible.
