import { describe, it, expect } from 'vitest';
import { loginSchema, authUserSchema, authTokenSchema } from '../schemas';

describe('loginSchema', () => {
  it('validates correct login input', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password over 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: 'a'.repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it('accepts password exactly 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts password exactly 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'demo@bank.com',
      password: 'a'.repeat(128),
    });
    expect(result.success).toBe(true);
  });
});

describe('authUserSchema', () => {
  const validUser = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'demo@bank.com',
    name: 'Alex Johnson',
    roles: ['user', 'admin'],
    permissions: ['payments:read', 'payments:write'],
  };

  it('validates a correct user', () => {
    const result = authUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID for id', () => {
    const result = authUserSchema.safeParse({ ...validUser, id: 'bad-id' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = authUserSchema.safeParse({ ...validUser, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('accepts empty roles array', () => {
    const result = authUserSchema.safeParse({ ...validUser, roles: [] });
    expect(result.success).toBe(true);
  });

  it('accepts empty permissions array', () => {
    const result = authUserSchema.safeParse({ ...validUser, permissions: [] });
    expect(result.success).toBe(true);
  });
});

describe('authTokenSchema', () => {
  it('validates correct token response', () => {
    const result = authTokenSchema.safeParse({
      accessToken: 'mock-access-token-123',
      refreshToken: 'mock-refresh-token-456',
      expiresIn: 3600,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing accessToken', () => {
    const result = authTokenSchema.safeParse({
      refreshToken: 'mock-refresh-token-456',
      expiresIn: 3600,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing refreshToken', () => {
    const result = authTokenSchema.safeParse({
      accessToken: 'mock-access-token-123',
      expiresIn: 3600,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing expiresIn', () => {
    const result = authTokenSchema.safeParse({
      accessToken: 'mock-access-token-123',
      refreshToken: 'mock-refresh-token-456',
    });
    expect(result.success).toBe(false);
  });
});
