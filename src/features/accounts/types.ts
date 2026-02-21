export type AccountType = 'checking' | 'savings' | 'money_market' | 'cd';
export type AccountStatus = 'active' | 'inactive' | 'frozen';
export type TransactionType = 'credit' | 'debit';
export type TransactionCategory =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'payment'
  | 'fee'
  | 'interest'
  | 'refund';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  openedAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  balance: number;
  description: string;
  merchant?: string;
  reference: string;
  status: 'posted' | 'pending';
  createdAt: string;
}

export interface AccountListResponse {
  data: Account[];
  total: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}
