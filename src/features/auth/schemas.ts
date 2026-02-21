import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters' })
    .max(128, { error: 'Password is too long' }),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const authTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type AuthTokenResponse = z.infer<typeof authTokenSchema>;

export const authUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});
export type AuthUser = z.infer<typeof authUserSchema>;
