const envSchema = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'Enterprise Banking',
  ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true',
} as const;
export const env = envSchema;
