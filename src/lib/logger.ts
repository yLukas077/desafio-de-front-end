/**
 * Minimal structured logger. JSON output in production so log aggregators
 * can parse it; key=value pairs in dev for readability. No external
 * dependency — pino would be the next step if log volume grows.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function currentLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as Level;
  return LEVELS[raw] ?? LEVELS.info;
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

function format(level: Level, fields: Record<string, unknown>, msg: string): string {
  const ts = new Date().toISOString();
  if (isProd()) {
    return JSON.stringify({ ts, level, msg, ...fields });
  }
  const pairs = Object.entries(fields)
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(' ');
  return `${ts} ${level.toUpperCase().padEnd(5)} ${msg}${pairs ? ' ' + pairs : ''}`;
}

function emit(level: Level, fieldsOrMsg: Record<string, unknown> | string, msg?: string) {
  if (LEVELS[level] < currentLevel()) return;
  const fields = typeof fieldsOrMsg === 'string' ? {} : fieldsOrMsg;
  const message = typeof fieldsOrMsg === 'string' ? fieldsOrMsg : (msg ?? '');
  const line = format(level, fields, message);
  // eslint-disable-next-line no-console
  (level === 'error' || level === 'warn' ? console.error : console.log)(line);
}

export const log = {
  debug: (fields: Record<string, unknown> | string, msg?: string) => emit('debug', fields, msg),
  info: (fields: Record<string, unknown> | string, msg?: string) => emit('info', fields, msg),
  warn: (fields: Record<string, unknown> | string, msg?: string) => emit('warn', fields, msg),
  error: (fields: Record<string, unknown> | string, msg?: string) => emit('error', fields, msg),
};
