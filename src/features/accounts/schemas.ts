import { z } from 'zod';

export const accountTypeSchema = z.enum(['checking', 'savings', 'money_market', 'cd']);
export const accountStatusSchema = z.enum(['active', 'inactive', 'frozen']);
export const transactionTypeSchema = z.enum(['credit', 'debit']);
export const transactionCategorySchema = z.enum([
  'deposit',
  'withdrawal',
  'transfer',
  'payment',
  'fee',
  'interest',
  'refund',
]);

export const accountSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, { error: 'Account name is required' }),
  type: accountTypeSchema,
  accountNumber: z.string(),
  routingNumber: z.string(),
  balance: z.number(),
  availableBalance: z.number(),
  currency: z.string(),
  status: accountStatusSchema,
  openedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const transactionSchema = z.object({
  id: z.uuid(),
  accountId: z.uuid(),
  type: transactionTypeSchema,
  category: transactionCategorySchema,
  amount: z.number().positive({ error: 'Amount must be positive' }),
  balance: z.number(),
  description: z.string(),
  merchant: z.string().optional(),
  reference: z.string(),
  status: z.enum(['posted', 'pending']),
  createdAt: z.iso.datetime(),
});

export const accountListSchema = z.object({
  data: z.array(accountSchema),
  total: z.number(),
});

export const transactionListSchema = z.object({
  data: z.array(transactionSchema),
  total: z.number(),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
