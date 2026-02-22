// e2e/transfers.spec.ts — Fund Transfer E2E tests
import { test, expect } from '@playwright/test';

// Helper: log in as the demo user before each test
async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('demo@bank.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/');
}

test.describe('Fund Transfers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test('navigates to transfers page and shows wizard', async ({ page }) => {
    await page.goto('/transfers');

    await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();
    await expect(page.getByText('Move money between your accounts')).toBeVisible();

    // Transfer wizard should show step 1 - Select Accounts heading
    await expect(page.getByRole('heading', { name: 'Select Accounts' })).toBeVisible();
    await expect(page.getByText('From Account')).toBeVisible();
    await expect(page.getByText('To Account')).toBeVisible();
  });

  test('validates that accounts must be selected before continuing', async ({ page }) => {
    await page.goto('/transfers');

    // Wait for wizard to load
    await expect(page.getByRole('heading', { name: 'Select Accounts' })).toBeVisible();

    // Click Continue without selecting accounts
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should show a validation error
    await expect(page.getByText('Please select a source account.')).toBeVisible();
  });

  test('completes transfer wizard end-to-end', async ({ page }) => {
    await page.goto('/transfers');

    // Step 1: Select accounts - wait for the heading and account data to load
    await expect(page.getByRole('heading', { name: 'Select Accounts' })).toBeVisible();

    // Wait for the selects to be present and have account options loaded
    const fromSelect = page.locator('select').first();
    await expect(fromSelect).toBeVisible({ timeout: 10000 });

    // Select "From" account - Primary Checking
    await fromSelect.selectOption({ index: 1 });

    // Select "To" account - pick the first available destination
    const toSelect = page.locator('select').nth(1);
    await toSelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Enter amount
    await expect(page.getByRole('heading', { name: 'Enter Amount' })).toBeVisible();
    await page.getByLabel('Transfer Amount ($)').fill('500');
    await page.getByLabel('Memo (optional)').fill('Monthly savings');
    await page.getByRole('button', { name: 'Review Transfer' }).click();

    // Step 3: Confirm transfer
    await expect(page.getByRole('heading', { name: 'Review Transfer' })).toBeVisible();
    await expect(page.getByText('$500.00')).toBeVisible();
    await expect(page.getByText('Monthly savings')).toBeVisible();

    // Submit the transfer
    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    // Should show success
    await expect(page.getByText('Transfer Complete!')).toBeVisible({ timeout: 10000 });
  });

  test('navigates back through wizard steps', async ({ page }) => {
    await page.goto('/transfers');

    // Step 1: Select accounts
    await expect(page.getByRole('heading', { name: 'Select Accounts' })).toBeVisible();

    const fromSelect = page.locator('select').first();
    await expect(fromSelect).toBeVisible({ timeout: 10000 });
    await fromSelect.selectOption({ index: 1 });

    const toSelect = page.locator('select').nth(1);
    await toSelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Click Back
    await expect(page.getByRole('heading', { name: 'Enter Amount' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    // Should be back to step 1
    await expect(page.getByRole('heading', { name: 'Select Accounts' })).toBeVisible();
  });
});
