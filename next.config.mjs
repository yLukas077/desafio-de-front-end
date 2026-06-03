/**
 * Security headers applied to every response. Tuned for this app
 * specifically — broader CSPs are fine for libraries but invite
 * vulnerabilities in product code where you know your assets.
 *
 * - default-src 'self': everything blocked unless an allowlist below opts in.
 * - img-src includes data: for inline SVGs from react-icons.
 * - style-src 'unsafe-inline' is unavoidable with CSS Modules + Next; the
 *   alternative is nonce-based CSP which requires SSR work we don't need.
 * - connect-src 'self' covers our internal /api/weather; OpenWeather is
 *   called server-side and never appears in browser network panel.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy',   value: csp },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_TARGET === 'docker' ? 'standalone' : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};



export default nextConfig;
