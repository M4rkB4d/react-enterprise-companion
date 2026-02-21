import { z } from 'zod';

export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentSchema = z.object({
  id: z.uuid(),
  payeeId: z.uuid(),
  amount: z.number().positive({ error: 'Amount must be greater than 0' }),
  memo: z.string().max(200).optional(),
  status: paymentStatusSchema,
  scheduledDate: z.iso.datetime(),
  processedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
});
export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentSchema = z.object({
  payeeId: z.uuid({ error: 'Please select a payee' }),
  amount: z
    .number()
    .positive({ error: 'Amount must be greater than $0' })
    .max(50_000, { error: 'Maximum payment is $50,000' })
    .transform((dollars) => Math.round(dollars * 100)),
  scheduledDate: z
    .string()
    .min(1, { error: 'Payment date is required' })
    .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
      error: 'Payment date cannot be in the past',
    }),
  memo: z.string().max(200, { error: 'Memo is too long' }).optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const paymentListSchema = z.object({
  data: z.array(paymentSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});
export type PaymentListResponse = z.infer<typeof paymentListSchema>;
