// src/i18n/translated-error-map.ts

import type { IntlShape } from 'react-intl';
import type { ZodIssue } from 'zod';

/**
 * Creates a Zod 4 error map that resolves error messages
 * through react-intl translations.
 *
 * Each Zod error message is treated as a translation key.
 * The error map looks up the key in the current locale's messages.
 *
 * @example
 * // In a Zod schema:
 * z.string().min(1, { error: 'validation.required' })
 *
 * // The error map resolves 'validation.required' to:
 * // "This field is required" (en-US)
 *
 * @see Doc 06 section 3 for Zod schema patterns
 */
export function createTranslatedErrorMap(
  intl: IntlShape,
) {
  return (issue: ZodIssue) => {
    // If the issue has a custom message, treat it as a translation key
    const translationKey = issue.message;

    if (!translationKey) return;

    // Attempt to resolve the translation key
    try {
      const translated = intl.formatMessage(
        { id: translationKey, defaultMessage: translationKey },
        extractErrorValues(issue),
      );
      return translated;
    } catch {
      // Fallback to the raw key if translation fails
      return translationKey;
    }
  };
}

/**
 * Extracts ICU message values from a Zod issue.
 * Maps Zod issue properties to translation variable names.
 */
function extractErrorValues(
  issue: ZodIssue,
): Record<string, string | number> {
  const values: Record<string, string | number> = {};

  // Extract common validation parameters
  if ('minimum' in issue && issue.minimum !== undefined) {
    values.min = issue.minimum as number;
  }
  if ('maximum' in issue && issue.maximum !== undefined) {
    values.max = issue.maximum as number;
  }

  return values;
}
