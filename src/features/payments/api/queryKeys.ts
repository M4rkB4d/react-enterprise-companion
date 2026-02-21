export const paymentQueryKeys = {
  payees: {
    all: ['payees'] as const,
    list: () => [...paymentQueryKeys.payees.all, 'list'] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...paymentQueryKeys.payments.all, 'list', filters] as const,
    detail: (id: string) => [...paymentQueryKeys.payments.all, 'detail', id] as const,
  },
  scheduled: {
    all: ['scheduled-payments'] as const,
    list: () => [...paymentQueryKeys.scheduled.all, 'list'] as const,
  },
} as const;
