// src/features/payments/utils/handlePaymentError.ts — Doc 13 §10.2
import { AxiosError } from 'axios';
import type { ZodError } from 'zod';

interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>;
}

/** Convert API/validation errors into user-friendly messages */
export function getPaymentErrorMessage(error: unknown): string {
  // Zod validation error
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as ZodError;
    return zodError.issues[0]?.message ?? 'Validation failed';
  }

  // Axios API error
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    switch (error.response?.status) {
      case 400:
        return data?.message ?? 'Invalid payment details';
      case 402:
        return 'Insufficient funds for this payment';
      case 403:
        return 'You do not have permission to make payments';
      case 404:
        return 'Payee not found. They may have been removed.';
      case 409:
        return 'A duplicate payment was detected';
      case 429:
        return 'Too many payment attempts. Please wait a moment.';
      case 503:
        return 'Payment service is temporarily unavailable';
      default:
        return data?.message ?? 'Payment failed. Please try again.';
    }
  }

  return 'An unexpected error occurred';
}
