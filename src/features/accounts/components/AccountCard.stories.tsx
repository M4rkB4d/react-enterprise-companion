import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { AccountCard } from './AccountCard';
import type { Account } from '../types';

const baseAccount: Account = {
  id: '1',
  name: 'Primary Checking',
  type: 'checking',
  accountNumber: '****4521',
  routingNumber: '021000021',
  balance: 542389,
  availableBalance: 542389,
  currency: 'USD',
  status: 'active',
  openedAt: '2023-01-15T00:00:00Z',
  updatedAt: '2024-12-01T00:00:00Z',
};

const meta = {
  title: 'Features/Accounts/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-md">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checking: Story = {
  args: {
    account: baseAccount,
  },
};

export const Savings: Story = {
  args: {
    account: {
      ...baseAccount,
      id: '2',
      name: 'High-Yield Savings',
      type: 'savings',
      accountNumber: '****7832',
      balance: 2500000,
      availableBalance: 2500000,
    },
  },
};

export const NegativeBalance: Story = {
  args: {
    account: {
      ...baseAccount,
      id: '3',
      name: 'Overdrawn Checking',
      type: 'checking',
      accountNumber: '****9901',
      balance: -15025,
      availableBalance: -15025,
    },
  },
};

export const FrozenAccount: Story = {
  args: {
    account: {
      ...baseAccount,
      id: '4',
      name: 'Frozen Savings',
      type: 'savings',
      accountNumber: '****3344',
      balance: 100000,
      availableBalance: 0,
      status: 'frozen',
    },
  },
};

export const MoneyMarket: Story = {
  args: {
    account: {
      ...baseAccount,
      id: '5',
      name: 'Money Market Plus',
      type: 'money_market',
      accountNumber: '****6655',
      balance: 7500000,
      availableBalance: 7450000,
    },
  },
};

export const CertificateOfDeposit: Story = {
  args: {
    account: {
      ...baseAccount,
      id: '6',
      name: '12-Month CD',
      type: 'cd',
      accountNumber: '****1122',
      balance: 1000000,
      availableBalance: 1000000,
    },
  },
};
