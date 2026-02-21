// e2e/payments.spec.ts — Bill Payment E2E tests (Doc 13 §12.2)
import { test, expect } from '@playwright/test';

// Helper: log in as the demo user before each test
async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('demo@bank.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/');
}

// Tomorrow's date formatted as YYYY-MM-DD for the date input
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

test.describe('Bill Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test('navigates to payments page from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /bill payments/i }).click();

    await expect(page).toHaveURL('/payments');
    await expect(page.getByRole('heading', { name: 'Bill Payments' })).toBeVisible();
  });

  test('shows New Payment button for authorized user', async ({ page }) => {
    await page.goto('/payments');

    await expect(page.getByRole('button', { name: /new payment/i })).toBeVisible();
  });

  test('complete payment wizard end-to-end', async ({ page }) => {
    // Navigate to payments and click New Payment
    await page.goto('/payments');
    await page.getByRole('button', { name: /new payment/i }).click();

    // Step 1: Select payee — should see "Who are you paying?"
    await expect(page.getByText('Who are you paying?')).toBeVisible();
    await page.getByText('PG&E').click();

    // Step 2: Enter payment details
    await expect(page.getByRole('heading', { name: 'Payment Details' })).toBeVisible();
    await page.getByLabel('Amount ($)').fill('150.99');
    await page.getByLabel('Payment Date').fill(getTomorrowDate());
    await page.getByLabel('Memo (optional)').fill('March utility bill');
    await page.getByRole('button', { name: 'Continue to Review' }).click();

    // Step 3: Review & confirm
    await expect(page.getByRole('heading', { name: 'Review Payment' })).toBeVisible();
    await expect(page.getByText('$150.99')).toBeVisible();
    await expect(page.getByText('PG&E')).toBeVisible();
    await expect(page.getByText('March utility bill')).toBeVisible();

    // Confirm payment
    await page.getByRole('button', { name: 'Confirm & Pay' }).click();

    // Should show success (form action + API call may take a moment)
    await expect(page.getByText('Payment Submitted!')).toBeVisible({ timeout: 10000 });

    // Navigate back
    await page.getByRole('button', { name: 'Back to Payments' }).click();
    await expect(page).toHaveURL('/payments');
  });

  test('validates empty amount in step 2', async ({ page }) => {
    await page.goto('/payments/new');

    // Select a payee
    await page.getByText('PG&E').click();

    // Try to continue without filling amount
    await page.getByRole('button', { name: 'Continue to Review' }).click();

    // Should show validation error (FormField renders errors with role="alert")
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('navigates back through steps', async ({ page }) => {
    await page.goto('/payments/new');

    // Step 1: Select payee
    await page.getByText('PG&E').click();

    // On step 2, click back
    await page.getByRole('button', { name: 'Back' }).click();

    // Should be back on step 1
    await expect(page.getByText('Who are you paying?')).toBeVisible();
  });
});
