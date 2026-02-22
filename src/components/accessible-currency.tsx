// src/components/accessible-currency.tsx

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { getCurrencyDecimals } from '@/i18n/currency-config';

interface AccessibleCurrencyProps {
  amount: number;
  currency: string;
  className?: string;
}

/**
 * Currency amount with accessible screen reader announcement.
 *
 * Visual: "$1,234.56"
 * Screen reader: "one thousand two hundred thirty-four dollars and fifty-six cents"
 *
 * The aria-label uses `currencyDisplay: 'name'` to produce a
 * human-readable string that the screen reader can pronounce correctly.
 */
export function AccessibleCurrency({
  amount,
  currency,
  className = '',
}: AccessibleCurrencyProps) {
  const intl = useIntl();
  const decimals = getCurrencyDecimals(currency);

  // Visual format: "$1,234.56"
  const visualFormat = useMemo(
    () =>
      new Intl.NumberFormat(intl.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount),
    [intl.locale, currency, amount, decimals],
  );

  // Screen reader format: "1,234.56 US dollars"
  const ariaFormat = useMemo(
    () =>
      new Intl.NumberFormat(intl.locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'name',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount),
    [intl.locale, currency, amount, decimals],
  );

  return (
    <span
      className={`tabular-nums ${className}`}
      aria-label={ariaFormat}
    >
      <span aria-hidden="true">{visualFormat}</span>
    </span>
  );
}
