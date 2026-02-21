import { http, HttpResponse } from 'msw';
import type { AuditEvent, AuditAction, AuditSeverity } from '../types';

const userNames = ['Alex Johnson', 'Sarah Miller', 'James Chen'];
const ipAddresses = ['192.168.1.42', '10.0.0.15', '172.16.0.99', '192.168.1.100'];

function generateAuditEvents(): AuditEvent[] {
  const events: AuditEvent[] = [];
  const baseDate = new Date('2026-02-20T18:00:00Z');

  const templates: Array<{
    action: AuditAction;
    severity: AuditSeverity;
    metadata: Record<string, unknown>;
  }> = [
    { action: 'auth.login', severity: 'info', metadata: { method: 'password' } },
    { action: 'auth.login', severity: 'info', metadata: { method: 'sso' } },
    { action: 'auth.logout', severity: 'info', metadata: {} },
    {
      action: 'auth.login_failed',
      severity: 'warning',
      metadata: { reason: 'Invalid password', attemptNumber: 1 },
    },
    {
      action: 'auth.login_failed',
      severity: 'warning',
      metadata: { reason: 'Invalid password', attemptNumber: 2 },
    },
    {
      action: 'auth.login_failed',
      severity: 'error',
      metadata: { reason: 'Account locked', attemptNumber: 5 },
    },
    {
      action: 'account.viewed',
      severity: 'info',
      metadata: { accountId: '10000000-0000-4000-8000-000000000001' },
    },
    {
      action: 'account.viewed',
      severity: 'info',
      metadata: { accountId: '10000000-0000-4000-8000-000000000002' },
    },
    {
      action: 'account.viewed',
      severity: 'info',
      metadata: { accountId: '10000000-0000-4000-8000-000000000003' },
    },
    {
      action: 'payment.created',
      severity: 'info',
      metadata: { paymentId: 'p-001', amount: 15099, payeeId: 'payee-001' },
    },
    {
      action: 'payment.created',
      severity: 'info',
      metadata: { paymentId: 'p-002', amount: 25000, payeeId: 'payee-002' },
    },
    {
      action: 'payment.created',
      severity: 'info',
      metadata: { paymentId: 'p-003', amount: 8750, payeeId: 'payee-001' },
    },
    { action: 'payment.cancelled', severity: 'warning', metadata: { paymentId: 'p-002' } },
    {
      action: 'transfer.created',
      severity: 'info',
      metadata: {
        transferId: 't-001',
        amount: 50000,
        fromAccountId: 'acct-001',
        toAccountId: 'acct-002',
      },
    },
    {
      action: 'transfer.created',
      severity: 'info',
      metadata: {
        transferId: 't-002',
        amount: 100000,
        fromAccountId: 'acct-001',
        toAccountId: 'acct-003',
      },
    },
    {
      action: 'transfer.failed',
      severity: 'error',
      metadata: { reason: 'Insufficient funds', amount: 999999 },
    },
    {
      action: 'payee.created',
      severity: 'info',
      metadata: { payeeId: 'payee-003', payeeName: 'Pacific Gas & Electric' },
    },
    {
      action: 'payee.created',
      severity: 'info',
      metadata: { payeeId: 'payee-004', payeeName: 'State Farm Insurance' },
    },
    {
      action: 'payee.deleted',
      severity: 'warning',
      metadata: { payeeId: 'payee-005', payeeName: 'Old Vendor' },
    },
    {
      action: 'settings.updated',
      severity: 'info',
      metadata: { setting: 'notifications', oldValue: 'email', newValue: 'email+sms' },
    },
    {
      action: 'settings.updated',
      severity: 'info',
      metadata: { setting: 'language', oldValue: 'en-US', newValue: 'es-MX' },
    },
    {
      action: 'settings.updated',
      severity: 'warning',
      metadata: { setting: 'two_factor', oldValue: 'disabled', newValue: 'enabled' },
    },
    { action: 'profile.updated', severity: 'info', metadata: { fields: ['name', 'phone'] } },
    { action: 'profile.updated', severity: 'info', metadata: { fields: ['email'] } },
    { action: 'auth.login', severity: 'info', metadata: { method: 'password' } },
    {
      action: 'payment.created',
      severity: 'info',
      metadata: { paymentId: 'p-004', amount: 32500, payeeId: 'payee-003' },
    },
    {
      action: 'transfer.created',
      severity: 'info',
      metadata: {
        transferId: 't-003',
        amount: 75000,
        fromAccountId: 'acct-002',
        toAccountId: 'acct-001',
      },
    },
    {
      action: 'account.viewed',
      severity: 'info',
      metadata: { accountId: '10000000-0000-4000-8000-000000000001' },
    },
    {
      action: 'auth.login_failed',
      severity: 'critical',
      metadata: { reason: 'Suspicious IP detected', attemptNumber: 3 },
    },
    { action: 'auth.logout', severity: 'info', metadata: {} },
    {
      action: 'payment.created',
      severity: 'info',
      metadata: { paymentId: 'p-005', amount: 45000, payeeId: 'payee-004' },
    },
    {
      action: 'transfer.failed',
      severity: 'error',
      metadata: { reason: 'Daily limit exceeded', amount: 150000 },
    },
    {
      action: 'payee.created',
      severity: 'info',
      metadata: { payeeId: 'payee-006', payeeName: 'Comcast Internet' },
    },
    {
      action: 'settings.updated',
      severity: 'info',
      metadata: { setting: 'theme', oldValue: 'light', newValue: 'dark' },
    },
    { action: 'auth.login', severity: 'info', metadata: { method: 'password' } },
  ];

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const date = new Date(baseDate.getTime() - i * 45 * 60 * 1000); // 45 min apart
    const userName = userNames[i % userNames.length];

    events.push({
      id: `audit-${String(i).padStart(4, '0')}-4000-8000-${String(i).padStart(12, '0')}`,
      userId: `user-${String((i % 3) + 1).padStart(3, '0')}`,
      userName,
      action: template.action,
      severity: template.severity,
      ipAddress: ipAddresses[i % ipAddresses.length],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: date.toISOString(),
      metadata: template.metadata,
    } as AuditEvent);
  }

  return events;
}

const allEvents = generateAuditEvents();

export const auditHandlers = [
  http.get('*/api/v1/audit/events', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
    const actionFilter = url.searchParams.get('action');
    const severityFilter = url.searchParams.get('severity');
    const searchQuery = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...allEvents];

    if (actionFilter) {
      filtered = filtered.filter((e) => e.action === actionFilter);
    }
    if (severityFilter) {
      filtered = filtered.filter((e) => e.severity === severityFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.userName.toLowerCase().includes(searchQuery) ||
          e.action.toLowerCase().includes(searchQuery) ||
          e.ipAddress.includes(searchQuery) ||
          JSON.stringify(e.metadata).toLowerCase().includes(searchQuery),
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  http.post('*/api/v1/audit/events', () => {
    return HttpResponse.json({ success: true }, { status: 201 });
  }),
];
