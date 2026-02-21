import { http, HttpResponse } from 'msw';
import type { Account, Transaction, TransactionCategory } from '../types';

const mockAccounts: Account[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Primary Checking',
    type: 'checking',
    accountNumber: '****4521',
    routingNumber: '021000021',
    balance: 1_234_567,
    availableBalance: 1_200_000,
    currency: 'USD',
    status: 'active',
    openedAt: '2022-03-15T00:00:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'High-Yield Savings',
    type: 'savings',
    accountNumber: '****7832',
    routingNumber: '021000021',
    balance: 5_678_900,
    availableBalance: 5_678_900,
    currency: 'USD',
    status: 'active',
    openedAt: '2022-03-15T00:00:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Money Market Reserve',
    type: 'money_market',
    accountNumber: '****9156',
    routingNumber: '021000021',
    balance: 25_000_000,
    availableBalance: 24_950_000,
    currency: 'USD',
    status: 'active',
    openedAt: '2023-08-01T00:00:00Z',
    updatedAt: '2026-02-18T16:45:00Z',
  },
];

function generateTransactions(accountId: string, count: number): Transaction[] {
  const merchants = [
    'Whole Foods Market',
    'Amazon.com',
    'Netflix',
    'Shell Gas Station',
    'Target',
    'Starbucks',
    'United Airlines',
    'Apple Store',
    'Home Depot',
    'Costco',
    'Uber',
    'Spotify',
    'Walmart',
    'CVS Pharmacy',
    'AT&T',
  ];

  const descriptions: Record<string, string[]> = {
    deposit: [
      'Direct Deposit - Payroll',
      'Mobile Check Deposit',
      'ACH Transfer In',
      'Wire Transfer In',
    ],
    withdrawal: ['ATM Withdrawal', 'Cash Withdrawal', 'Cashier Check'],
    transfer: ['Transfer to Savings', 'Transfer from Checking', 'Internal Transfer'],
    payment: ['POS Purchase', 'Online Purchase', 'Bill Payment', 'Recurring Payment'],
    fee: ['Monthly Service Fee', 'Overdraft Fee', 'Wire Transfer Fee', 'ATM Fee'],
    interest: ['Interest Payment', 'Bonus Interest', 'Monthly Interest Credit'],
    refund: ['Merchant Refund', 'Dispute Credit', 'Price Adjustment'],
  };

  const categories: TransactionCategory[] = [
    'deposit',
    'withdrawal',
    'transfer',
    'payment',
    'fee',
    'interest',
    'refund',
  ];
  const txns: Transaction[] = [];
  let balance = accountId.endsWith('001')
    ? 1_234_567
    : accountId.endsWith('002')
      ? 5_678_900
      : 25_000_000;

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const isCredit = ['deposit', 'interest', 'refund'].includes(category);
    const amount = Math.round(Math.random() * 50000 + 100);
    const descList = descriptions[category];
    const desc = descList[Math.floor(Math.random() * descList.length)];
    const merchant = ['payment', 'refund'].includes(category)
      ? merchants[Math.floor(Math.random() * merchants.length)]
      : undefined;

    if (isCredit) {
      balance += amount;
    } else {
      balance -= amount;
    }

    const date = new Date('2026-02-20T00:00:00Z');
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 8);
    date.setMinutes(Math.floor(Math.random() * 60));

    txns.push({
      id: `t${accountId.slice(-3)}-${String(i).padStart(4, '0')}-4000-8000-${String(i).padStart(12, '0')}`,
      accountId,
      type: isCredit ? 'credit' : 'debit',
      category,
      amount,
      balance,
      description: desc,
      merchant,
      reference: `REF${Date.now()}${i}`,
      status: i < 2 ? 'pending' : 'posted',
      createdAt: date.toISOString(),
    });
  }

  return txns;
}

const allTransactions: Record<string, Transaction[]> = {
  '10000000-0000-4000-8000-000000000001': generateTransactions(
    '10000000-0000-4000-8000-000000000001',
    55,
  ),
  '10000000-0000-4000-8000-000000000002': generateTransactions(
    '10000000-0000-4000-8000-000000000002',
    30,
  ),
  '10000000-0000-4000-8000-000000000003': generateTransactions(
    '10000000-0000-4000-8000-000000000003',
    20,
  ),
};

export const accountHandlers = [
  http.get('*/api/v1/accounts', () => {
    return HttpResponse.json({
      data: mockAccounts,
      total: mockAccounts.length,
    });
  }),

  http.get('*/api/v1/accounts/:accountId', ({ params }) => {
    const account = mockAccounts.find((a) => a.id === params.accountId);
    if (!account) {
      return HttpResponse.json({ message: 'Account not found' }, { status: 404 });
    }
    return HttpResponse.json(account);
  }),

  http.get('*/api/v1/accounts/:accountId/transactions', ({ params, request }) => {
    const accountId = params.accountId as string;
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const typeFilter = url.searchParams.get('type');
    const categoryFilter = url.searchParams.get('category');

    let txns = allTransactions[accountId] ?? [];

    if (typeFilter) {
      txns = txns.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter) {
      txns = txns.filter((t) => t.category === categoryFilter);
    }

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = txns.findIndex((t) => t.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const page = txns.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < txns.length;
    const nextCursor = hasMore ? page[page.length - 1]?.id : undefined;

    return HttpResponse.json({
      data: page,
      total: txns.length,
      nextCursor,
      hasMore,
    });
  }),
];
