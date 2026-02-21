import { http, HttpResponse } from 'msw';
import type { AuthUser } from '../schemas';

const DEMO_USER: AuthUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'demo@bank.com',
  name: 'Alex Johnson',
  roles: ['user', 'admin'],
  permissions: [
    'payments:read',
    'payments:write',
    'accounts:read',
    'transfers:write',
    'audit:read',
  ],
};

const DEMO_PASSWORD = 'password123';

let loginAttempts = 0;

export const authHandlers = [
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Simulate locked account after 5 failed attempts
    if (loginAttempts >= 5) {
      loginAttempts = 0;
      return HttpResponse.json(
        { message: 'Account locked due to too many failed attempts' },
        { status: 423 },
      );
    }

    if (body.email === DEMO_USER.email && body.password === DEMO_PASSWORD) {
      loginAttempts = 0;
      return HttpResponse.json({
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
        user: DEMO_USER,
      });
    }

    loginAttempts++;
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('*/api/v1/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('*/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
      expiresIn: 3600,
    });
  }),

  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json(DEMO_USER);
  }),
];
