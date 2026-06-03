import { z } from 'zod';
import { ConfigurationError } from './errors';

/**
 * Validated at module load. A missing or malformed OPENWEATHER_API_KEY
 * crashes the process at startup rather than at the first user request.
 *
 * NODE_ENV is read from process; everything else is explicit so a typo
 * in `.env` becomes a build/start failure with a clear message.
 */
const Schema = z.object({
  OPENWEATHER_API_KEY: z
    .string()
    .min(8, 'OPENWEATHER_API_KEY is required (get one at openweathermap.org/api)'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
});

export type Env = z.infer<typeof Schema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;
  const result = Schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new ConfigurationError(`Invalid environment configuration:\n${issues}`);
  }
  cached = result.data;
  return cached;
}

/** Convenience accessor. Throws if called before env is loaded. */
export const env = new Proxy({} as Env, {
  get(_t, prop: keyof Env) {
    return loadEnv()[prop];
  },
});
