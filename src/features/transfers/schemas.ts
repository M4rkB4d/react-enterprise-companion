import { z } from 'zod';

export const transferStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

export const transferSchema = z.object({
  id: z.uuid(),
  fromAccountId: z.uuid(),
  toAccountId: z.uuid(),
  amount: z.number().positive(),
  memo: z.string().optional(),
  status: transferStatusSchema,
  createdAt: z.iso.datetime(),
  completedAt: z.iso.datetime().optional(),
});

export const createTransferSchema = z
  .object({
    fromAccountId: z.uuid({ error: 'Please select a source account' }),
    toAccountId: z.uuid({ error: 'Please select a destination account' }),
    amount: z
      .number({ error: 'Please enter a valid amount' })
      .positive({ error: 'Amount must be greater than $0' })
      .max(100_000, { error: 'Maximum transfer is $100,000' })
      .transform((dollars) => Math.round(dollars * 100)),
    memo: z.string().max(200, { error: 'Memo is too long' }).optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    error: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  });

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
