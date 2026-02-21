import { authHandlers } from '@/features/auth/__mocks__/handlers';
import { accountHandlers } from '@/features/accounts/__mocks__/handlers';

export const handlers = [...authHandlers, ...accountHandlers];
