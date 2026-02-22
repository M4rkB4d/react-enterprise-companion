// src/i18n/use-typed-intl.ts

import { useIntl, type IntlShape } from 'react-intl';
import type { MessageId } from './types';

interface MessageDescriptor {
  id: MessageId;
  defaultMessage?: string;
  description?: string;
}

/**
 * Type-safe wrapper around react-intl's useIntl hook.
 * Provides autocomplete for message IDs defined in types.ts.
 *
 * @example
 * const { t, formatNumber, formatDate } = useTypedIntl();
 * const greeting = t({ id: 'dashboard.title' }); // autocomplete!
 */
export function useTypedIntl() {
  const intl = useIntl();

  return {
    /** Shorthand for formatMessage with type-safe IDs */
    t: (descriptor: MessageDescriptor, values?: Parameters<IntlShape['formatMessage']>[1]) =>
      intl.formatMessage(descriptor, values),

    /** Format a number (delegates to Intl.NumberFormat) */
    formatNumber: (...args: Parameters<IntlShape['formatNumber']>) =>
      intl.formatNumber(...args),

    /** Format a date (delegates to Intl.DateTimeFormat) */
    formatDate: (...args: Parameters<IntlShape['formatDate']>) =>
      intl.formatDate(...args),

    /** Format relative time ("2 hours ago") */
    formatRelativeTime: (...args: Parameters<IntlShape['formatRelativeTime']>) =>
      intl.formatRelativeTime(...args),

    /** Format a list ("A, B, and C") */
    formatList: (...args: Parameters<IntlShape['formatList']>) =>
      intl.formatList(...args),

    /** The current locale string */
    locale: intl.locale,

    /** The full intl object for advanced usage */
    intl,
  };
}
