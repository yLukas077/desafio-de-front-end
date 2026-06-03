/**
 * Domain errors carry an HTTP status so the transport layer can translate
 * them without leaking implementation details. Anything not derived from
 * DomainError is treated as 500 with a generic message.
 */
export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
}

export class CityNotFoundError extends DomainError {
  readonly status = 404;
  readonly code = 'CITY_NOT_FOUND';
  constructor(cityId: string) {
    super(`Unknown city: ${cityId}`);
    this.name = 'CityNotFoundError';
  }
}

export class InvalidRequestError extends DomainError {
  readonly status = 400;
  readonly code = 'INVALID_REQUEST';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export class WeatherProviderError extends DomainError {
  readonly status = 502;
  readonly code = 'WEATHER_PROVIDER_ERROR';
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'WeatherProviderError';
  }
}

export class ConfigurationError extends DomainError {
  readonly status = 500;
  readonly code = 'CONFIGURATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class RateLimitedError extends DomainError {
  readonly status = 429;
  readonly code = 'RATE_LIMITED';
  constructor(readonly retryAfterSeconds: number) {
    super('Too many requests');
    this.name = 'RateLimitedError';
  }
}
