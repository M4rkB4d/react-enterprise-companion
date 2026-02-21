import { authHandlers } from '@/features/auth/__mocks__/handlers';
import { accountHandlers } from '@/features/accounts/__mocks__/handlers';
import { paymentHandlers } from '@/features/payments/__mocks__/handlers';
import { transferHandlers } from '@/features/transfers/__mocks__/handlers';
import { auditHandlers } from '@/features/audit/__mocks__/handlers';

export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...paymentHandlers,
  ...transferHandlers,
  ...auditHandlers,
];
