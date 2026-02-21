import { apiClient } from '@/api/client';
import {
  authTokenSchema,
  authUserSchema,
  type LoginInput,
  type AuthTokenResponse,
  type AuthUser,
} from './schemas';

export const authService = {
  async login(input: LoginInput): Promise<{ tokens: AuthTokenResponse; user: AuthUser }> {
    const response = await apiClient.post('/auth/login', input);
    const tokens = authTokenSchema.parse(response.data.tokens);
    const user = authUserSchema.parse(response.data.user);
    return { tokens, user };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return authTokenSchema.parse(response.data);
  },

  async me(): Promise<AuthUser> {
    const response = await apiClient.get('/auth/me');
    return authUserSchema.parse(response.data);
  },
} as const;
