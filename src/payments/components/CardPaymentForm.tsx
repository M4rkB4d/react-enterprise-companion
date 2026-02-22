// src/payments/components/CardPaymentForm.tsx

/**
 * PCI-COMPLIANT CARD PAYMENT FORM
 *
 * Uses Stripe Elements (iframe-based) to collect card data.
 * Your React code ONLY handles:
 *   - Payment amount and currency (metadata)
 *   - Payment intent creation (via your backend)
 *   - Confirmation result (success/failure)
 *
 * Your React code NEVER handles:
 *   - Card number (PAN)
 *   - Expiry date
 *   - CVC/CVV
 *   - Any raw card data
 *
 * Cross-ref: Doc 06 §3 for Zod schema patterns
 * Cross-ref: Doc 08 §4 for API service layer
 * Cross-ref: Doc 11 §4 for error handling
 */

import { useState, useCallback } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';
import { paymentMetadataSchema } from '@/compliance/schemas/payment-metadata';
import type { PaymentMetadata } from '@/compliance/schemas/payment-metadata';

/**
 * Load Stripe outside of the component tree to avoid
 * recreating the Stripe object on every render.
 */
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder',
);

/** Props for the inner payment form */
interface PaymentFormProps {
  readonly amount: number;
  readonly currency: string;
  readonly recipientName: string;
  readonly recipientAccountId: string;
  readonly onSuccess: (paymentIntentId: string) => void;
  readonly onError: (error: string) => void;
}

/** Stripe CardElement styling */
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: '#1e293b',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
  hidePostalCode: true,
} as const;

/**
 * Inner form component — must be rendered inside <Elements>.
 */
function PaymentFormInner({
  amount,
  currency,
  recipientName,
  recipientAccountId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { logEvent } = useAuditTrail();

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = useCallback((event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    setCardError(event.error?.message ?? null);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) return;

      setIsProcessing(true);

      try {
        // Step 1: Validate payment metadata (NOT card data)
        const metadata: PaymentMetadata = paymentMetadataSchema.parse({
          amount,
          currency,
          recipientName,
          recipientAccountId,
        });

        // Step 2: Create PaymentIntent on YOUR backend
        const response = await fetch('/api/v1/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: metadata.amount,
            currency: metadata.currency,
            recipientAccountId: metadata.recipientAccountId,
          }),
        });

        if (!response.ok) throw new Error('Failed to create payment intent');
        const { clientSecret } = await response.json();

        // Step 3: Confirm payment — Stripe handles card data
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: { card: cardElement },
          },
        );

        if (stripeError) {
          setCardError(stripeError.message ?? 'Payment failed');
          onError(stripeError.message ?? 'Payment failed');
          logEvent({
            action: 'payment.failed',
            resource: `payment:${clientSecret.split('_secret_')[0]}`,
            metadata: {
              amount: metadata.amount,
              currency: metadata.currency,
              errorCode: stripeError.code,
            },
          });
        } else if (paymentIntent) {
          onSuccess(paymentIntent.id);
          logEvent({
            action: 'payment.succeeded',
            resource: `payment:${paymentIntent.id}`,
            metadata: {
              amount: metadata.amount,
              currency: metadata.currency,
              status: paymentIntent.status,
            },
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        onError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      stripe,
      elements,
      amount,
      currency,
      recipientName,
      recipientAccountId,
      onSuccess,
      onError,
      logEvent,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Details</h3>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-500">Amount</span>
            <p className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
              }).format(amount / 100)}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Recipient</span>
            <p className="text-lg font-medium text-slate-900">{recipientName}</p>
          </div>
        </div>
      </div>

      {/* Card input — STRIPE handles this via iframe */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Card Information</h3>
        <p className="mb-3 text-xs text-slate-400">
          Card data is collected securely by Stripe. It never touches our servers.
        </p>
        <div className="rounded-md border border-slate-300 px-4 py-3">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {cardError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold
                   text-white transition-colors hover:bg-blue-700
                   disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

/**
 * PUBLIC COMPONENT: Wraps the form in the Stripe Elements provider.
 */
export function CardPaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}
