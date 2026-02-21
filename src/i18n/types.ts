// src/i18n/types.ts

/**
 * Type-safe message IDs.
 *
 * This type is auto-generated from the en-US.json source file.
 * Run `npm run i18n:extract` to update.
 */

export type MessageId =
  // Common
  | 'common.appName'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.back'
  | 'common.next'
  | 'common.submit'
  | 'common.search'
  | 'common.noResults'
  // Auth
  | 'auth.login'
  | 'auth.logout'
  | 'auth.forgotPassword'
  | 'auth.resetPassword'
  // Navigation
  | 'nav.dashboard'
  | 'nav.accounts'
  | 'nav.transfers'
  | 'nav.payments'
  | 'nav.settings'
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.totalBalance'
  | 'dashboard.recentTransactions'
  | 'dashboard.quickActions'
  // Accounts
  | 'accounts.title'
  | 'accounts.checking'
  | 'accounts.savings'
  | 'accounts.balance'
  | 'accounts.availableBalance'
  | 'accounts.accountNumber'
  // Transactions
  | 'transactions.title'
  | 'transactions.date'
  | 'transactions.description'
  | 'transactions.amount'
  | 'transactions.status'
  | 'transactions.pending'
  | 'transactions.completed'
  | 'transactions.failed'
  | 'transactions.count'
  // Transfers
  | 'transfers.title'
  | 'transfers.fromAccount'
  | 'transfers.toAccount'
  | 'transfers.amount'
  | 'transfers.scheduledDate'
  | 'transfers.confirm'
  | 'transfers.success'
  // Payments
  | 'payments.title'
  | 'payments.payee'
  | 'payments.amount'
  | 'payments.dueDate'
  | 'payments.payNow'
  // Settings
  | 'settings.title'
  | 'settings.language'
  | 'settings.currency'
  | 'settings.theme'
  | 'settings.notifications'
  // Errors
  | 'errors.generic'
  | 'errors.network'
  | 'errors.unauthorized'
  | 'errors.notFound'
  | 'errors.validation'
  // Validation
  | 'validation.required'
  | 'validation.email'
  | 'validation.minLength'
  | 'validation.maxLength'
  | 'validation.invalidAmount'
  | 'validation.insufficientFunds';

/**
 * Typed wrapper for useIntl().formatMessage().
 * Provides autocomplete for message IDs.
 */
export interface TypedIntl {
  formatMessage(
    descriptor: { id: MessageId; defaultMessage?: string },
    values?: Record<string, string | number | boolean | Date>,
  ): string;
}
