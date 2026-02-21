import { z } from 'zod';

/**
 * Environment configuration with Zod validation
 * Ensures all required environment variables are present and correctly typed
 */
const envSchema = z.object({
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_ERROR_LOGGING_ENDPOINT: z.string().url().optional(),
  MODE: z.string().default('development'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
});

export type AppEnvironment = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws at startup if required variables are missing
 */
function parseEnvironment(): AppEnvironment {
  const env = {
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_ERROR_LOGGING_ENDPOINT: import.meta.env.VITE_ERROR_LOGGING_ENDPOINT,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    // Return defaults in development, throw in production
    if (import.meta.env.DEV) {
      return envSchema.parse({});
    }
    throw new Error(`Invalid environment configuration: ${result.error.message}`);
  }

  return result.data;
}

export const environment = parseEnvironment();

// Convenience helpers
export const isDevelopment = environment.VITE_APP_ENV === 'development';
export const isStaging = environment.VITE_APP_ENV === 'staging';
export const isProduction = environment.VITE_APP_ENV === 'production';
