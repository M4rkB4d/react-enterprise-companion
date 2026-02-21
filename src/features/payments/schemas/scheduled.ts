import { z } from 'zod';

export const frequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']);
export type Frequency = z.infer<typeof frequencySchema>;

export const scheduledPaymentSchema = z.object({
  id: z.uuid(),
  payeeId: z.uuid(),
  amount: z.number().positive(),
  frequency: frequencySchema,
  nextPaymentDate: z.iso.datetime(),
  endDate: z.iso.datetime().optional(),
  isActive: z.boolean(),
});
export type ScheduledPayment = z.infer<typeof scheduledPaymentSchema>;

export const createScheduledPaymentSchema = z.object({
  payeeId: z.uuid({ error: 'Please select a payee' }),
  amount: z
    .number()
    .positive({ error: 'Amount must be greater than $0' })
    .max(50_000, { error: 'Maximum payment is $50,000' })
    .transform((dollars) => Math.round(dollars * 100)),
  frequency: frequencySchema,
  startDate: z.string().min(1, { error: 'Start date is required' }),
  endDate: z.string().optional(),
});
export type CreateScheduledPaymentInput = z.infer<typeof createScheduledPaymentSchema>;
