export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo?: string;
  status: TransferStatus;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo?: string;
}
