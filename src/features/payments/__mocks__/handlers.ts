import { http, HttpResponse } from 'msw';
import type { Payee, PaymentListResponse } from '../schemas';

const mockPayees: Payee[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Pacific Gas & Electric',
    nickname: 'PG&E',
    accountNumber: '****1234',
    category: 'utility',
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Chase Sapphire Preferred',
    nickname: 'Chase CC',
    accountNumber: '****5678',
    category: 'credit_card',
    createdAt: '2025-02-01T00:00:00Z',
  },
];

export const paymentHandlers = [
  http.get('*/api/v1/payees', () => {
    return HttpResponse.json({ data: mockPayees, total: mockPayees.length });
  }),
  http.post('*/api/v1/payees', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPayee: Payee = {
      id: crypto.randomUUID(),
      name: body.name as string,
      nickname: body.nickname as string,
      accountNumber: `****${(body.accountNumber as string).slice(-4)}`,
      category: body.category as Payee['category'],
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newPayee, { status: 201 });
  }),
  http.get('*/api/v1/payments', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const response: PaymentListResponse = {
      data: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          payeeId: mockPayees[0].id,
          amount: 15099,
          status: 'completed',
          scheduledDate: '2025-02-15T00:00:00Z',
          processedAt: '2025-02-15T08:30:00Z',
          createdAt: '2025-02-14T00:00:00Z',
        },
      ],
      total: 1,
      page,
      pageSize: 20,
      totalPages: 1,
    };
    return HttpResponse.json(response);
  }),
  http.post('*/api/v1/payments', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: crypto.randomUUID(),
        payeeId: body.payeeId,
        amount: body.amount,
        status: 'pending',
        scheduledDate: body.scheduledDate,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
