import { http, HttpResponse } from 'msw';

export const transferHandlers = [
  http.post('*/api/v1/transfers', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    // Simulate a brief processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return HttpResponse.json(
      {
        id: crypto.randomUUID(),
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amount: body.amount,
        memo: body.memo,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
