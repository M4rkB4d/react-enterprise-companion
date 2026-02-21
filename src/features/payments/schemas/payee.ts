import { z } from 'zod';

export const payeeCategorySchema = z.enum([
  'utility',
  'credit_card',
  'mortgage',
  'insurance',
  'other',
]);
export type PayeeCategory = z.infer<typeof payeeCategorySchema>;

export const payeeSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, { error: 'Payee name is required' }),
  nickname: z.string().min(1, { error: 'Nickname is required' }).max(30),
  accountNumber: z.string(),
  category: payeeCategorySchema,
  logoUrl: z.url().optional(),
  createdAt: z.iso.datetime(),
});
export type Payee = z.infer<typeof payeeSchema>;

export const createPayeeSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters' }),
  nickname: z.string().min(1, { error: 'Nickname is required' }).max(30),
  accountNumber: z
    .string()
    .min(4, { error: 'Account number too short' })
    .max(20, { error: 'Account number too long' })
    .regex(/^[0-9]+$/, { error: 'Account number must contain only digits' }),
  category: payeeCategorySchema,
});
export type CreatePayeeInput = z.infer<typeof createPayeeSchema>;

export const payeeListSchema = z.object({
  data: z.array(payeeSchema),
  total: z.number(),
});
export type PayeeListResponse = z.infer<typeof payeeListSchema>;
