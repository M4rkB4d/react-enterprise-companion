// e2e/auth.spec.ts — Authentication E2E tests (Doc 07 §11.3)
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    // Fill in demo credentials
    await page.getByLabel('Email Address').fill('demo@bank.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error and stay on login page
    await expect(page.getByText('Invalid email or password.')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/login');
  });

  test('protected routes redirect to login', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Enterprise Banking' })).toBeVisible();
  });

  test('protected payments route redirects to login', async ({ page }) => {
    await page.goto('/payments');

    await expect(page).toHaveURL('/login');
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Click sign in without filling anything
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation errors (from Zod schema via role="alert")
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});
