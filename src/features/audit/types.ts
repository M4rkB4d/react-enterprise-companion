export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'account.viewed'
  | 'payment.created'
  | 'payment.cancelled'
  | 'transfer.created'
  | 'transfer.failed'
  | 'payee.created'
  | 'payee.deleted'
  | 'settings.updated'
  | 'profile.updated';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEventBase {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AuthLoginEvent extends AuditEventBase {
  action: 'auth.login';
  metadata: { method: 'password' | 'sso' };
}

export interface AuthLogoutEvent extends AuditEventBase {
  action: 'auth.logout';
  metadata: Record<string, never>;
}

export interface AuthLoginFailedEvent extends AuditEventBase {
  action: 'auth.login_failed';
  metadata: { reason: string; attemptNumber: number };
}

export interface AccountViewedEvent extends AuditEventBase {
  action: 'account.viewed';
  metadata: { accountId: string };
}

export interface PaymentCreatedEvent extends AuditEventBase {
  action: 'payment.created';
  metadata: { paymentId: string; amount: number; payeeId: string };
}

export interface PaymentCancelledEvent extends AuditEventBase {
  action: 'payment.cancelled';
  metadata: { paymentId: string };
}

export interface TransferCreatedEvent extends AuditEventBase {
  action: 'transfer.created';
  metadata: { transferId: string; amount: number; fromAccountId: string; toAccountId: string };
}

export interface TransferFailedEvent extends AuditEventBase {
  action: 'transfer.failed';
  metadata: { reason: string; amount: number };
}

export interface PayeeCreatedEvent extends AuditEventBase {
  action: 'payee.created';
  metadata: { payeeId: string; payeeName: string };
}

export interface PayeeDeletedEvent extends AuditEventBase {
  action: 'payee.deleted';
  metadata: { payeeId: string; payeeName: string };
}

export interface SettingsUpdatedEvent extends AuditEventBase {
  action: 'settings.updated';
  metadata: { setting: string; oldValue: string; newValue: string };
}

export interface ProfileUpdatedEvent extends AuditEventBase {
  action: 'profile.updated';
  metadata: { fields: string[] };
}

export type AuditEvent =
  | AuthLoginEvent
  | AuthLogoutEvent
  | AuthLoginFailedEvent
  | AccountViewedEvent
  | PaymentCreatedEvent
  | PaymentCancelledEvent
  | TransferCreatedEvent
  | TransferFailedEvent
  | PayeeCreatedEvent
  | PayeeDeletedEvent
  | SettingsUpdatedEvent
  | ProfileUpdatedEvent;

export interface AuditEventListResponse {
  data: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
