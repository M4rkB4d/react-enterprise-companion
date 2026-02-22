// e2e/accounts.spec.ts — Accounts E2E tests
import { test, expect } from '@playwright/test';

// Helper: log in as the demo user before each test
async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('demo@bank.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/');
}

test.describe('Accounts', () => {
  test('unauthenticated users are redirected to login', async ({ page }) => {
    // Navigate directly without logging in
    await page.goto('/accounts');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test.describe('Authenticated', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDemoUser(page);
    });

    test('navigates to accounts page and shows account list', async ({ page }) => {
      await page.goto('/accounts');

      await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
      await expect(page.getByText('View your account balances and activity')).toBeVisible();

      // Verify mock accounts are rendered
      await expect(page.getByText('Primary Checking')).toBeVisible();
      await expect(page.getByText('High-Yield Savings')).toBeVisible();
      await expect(page.getByText('Money Market Reserve')).toBeVisible();
    });

    test('clicks an account to view details', async ({ page }) => {
      await page.goto('/accounts');

      // Click the Primary Checking account card (it's a link)
      await page.getByText('Primary Checking').click();

      // Should navigate to account detail page
      await expect(page).toHaveURL(/\/accounts\/10000000-0000-4000-8000-000000000001/);
      await expect(page.getByRole('heading', { name: 'Primary Checking' })).toBeVisible();
      await expect(page.getByText('Available Balance').first()).toBeVisible();
    });

    test('shows transaction list on account detail page', async ({ page }) => {
      await page.goto('/accounts/10000000-0000-4000-8000-000000000001');

      // Wait for account detail to load
      await expect(page.getByRole('heading', { name: 'Primary Checking' })).toBeVisible();

      // Verify transactions section appears
      await expect(page.getByText('Recent Transactions')).toBeVisible();

      // Wait for transaction table to load (it fetches data asynchronously)
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Should have a Load More button since there are 55 transactions and page size is 20
      await expect(page.getByRole('button', { name: 'Load More Transactions' })).toBeVisible();
    });

    test('navigates back to accounts list from detail page', async ({ page }) => {
      await page.goto('/accounts/10000000-0000-4000-8000-000000000001');

      // Wait for detail page to load
      await expect(page.getByRole('heading', { name: 'Primary Checking' })).toBeVisible();

      // Click the "Back to Accounts" link
      await page.getByText('Back to Accounts').click();

      // Should navigate back to accounts list
      await expect(page).toHaveURL('/accounts');
      await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    });
  });
});
