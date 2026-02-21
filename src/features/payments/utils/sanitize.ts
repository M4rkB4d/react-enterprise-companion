// src/features/payments/utils/sanitize.ts — Doc 13 §14.2
import DOMPurify from 'dompurify';

/** Sanitize text input to prevent XSS (strips all HTML tags) */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
}

/** Sanitize payment memo before submission */
export function sanitizeMemo(memo: string | undefined): string {
  if (!memo) return '';
  return sanitizeInput(memo).slice(0, 200);
}
