// src/features/payments/__tests__/PaymentWizard.test.tsx — Doc 13 §12.1
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PaymentWizard from '../components/PaymentWizard';
import { usePaymentWizardStore } from '../store/paymentWizardStore';

function renderWizard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/payments/new']}>
        <Routes>
          <Route path="/payments/new" element={<PaymentWizard />} />
          <Route path="/payments" element={<div>Payments Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PaymentWizard', () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    usePaymentWizardStore.getState().reset();
  });

  it('shows step 1 (Select Payee) initially', async () => {
    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('Who are you paying?')).toBeInTheDocument();
    });
  });

  it('shows payee list from MSW API', async () => {
    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('PG&E')).toBeInTheDocument();
      expect(screen.getByText('Chase CC')).toBeInTheDocument();
    });
  });

  it('advances to step 2 when payee is selected', async () => {
    const user = userEvent.setup();
    renderWizard();

    // Wait for payees to load from MSW
    await waitFor(() => {
      expect(screen.getByText('PG&E')).toBeInTheDocument();
    });

    // Click on a payee card
    await user.click(screen.getByText('PG&E'));

    // Should now show step 2 (Payment Details)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Payment Details' })).toBeInTheDocument();
    });
  });

  it('pre-selects payee via store and shows step 2', async () => {
    // Pre-set wizard to step 2 with a payee selected
    usePaymentWizardStore.getState().selectPayee({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Pacific Gas & Electric',
      nickname: 'PG&E',
      accountNumber: '****1234',
      category: 'utility',
      createdAt: '2025-01-15T00:00:00Z',
    });

    renderWizard();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Payment Details' })).toBeInTheDocument();
      expect(screen.getByText(/PG&E/)).toBeInTheDocument();
    });
  });
});
