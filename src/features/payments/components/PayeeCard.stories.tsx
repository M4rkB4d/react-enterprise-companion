import type { Meta, StoryObj } from '@storybook/react-vite';
import { PayeeCard } from './PayeeCard';
import type { Payee } from '../schemas';
const basePayee: Payee = {
  id: 'pay_001',
  name: 'Pacific Gas & Electric Company',
  nickname: 'PG&E Electric',
  accountNumber: '9876543210',
  category: 'utility',
  createdAt: '2024-06-15T10:00:00Z',
};

const meta = {
  title: 'Features/Payments/PayeeCard',
  component: PayeeCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    isSelected: false,
    onSelect: () => {},
  },
} satisfies Meta<typeof PayeeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Utility: Story = {
  args: {
    payee: basePayee,
  },
};

export const UtilitySelected: Story = {
  args: {
    payee: basePayee,
    isSelected: true,
  },
};

export const CreditCard: Story = {
  args: {
    payee: {
      ...basePayee,
      id: 'pay_002',
      name: 'Chase Bank Visa Platinum',
      nickname: 'Chase Visa',
      accountNumber: '4111222233334444',
      category: 'credit_card',
    },
  },
};

export const Mortgage: Story = {
  args: {
    payee: {
      ...basePayee,
      id: 'pay_003',
      name: 'Wells Fargo Home Mortgage',
      nickname: 'Home Mortgage',
      accountNumber: '5500112233',
      category: 'mortgage',
    },
  },
};

export const Insurance: Story = {
  args: {
    payee: {
      ...basePayee,
      id: 'pay_004',
      name: 'State Farm Insurance Co.',
      nickname: 'Auto Insurance',
      accountNumber: '7700334455',
      category: 'insurance',
    },
  },
};

export const Other: Story = {
  args: {
    payee: {
      ...basePayee,
      id: 'pay_005',
      name: 'Monthly Gym Membership',
      nickname: 'Gym',
      accountNumber: '1122334455',
      category: 'other',
    },
  },
};

export const AllCategories: Story = {
  args: {
    payee: basePayee,
    isSelected: false,
    onSelect: () => {},
  },
  render: () => {
    const categories: Array<{ payee: Payee; selected: boolean }> = [
      {
        payee: basePayee,
        selected: false,
      },
      {
        payee: {
          ...basePayee,
          id: 'pay_002',
          name: 'Chase Bank Visa Platinum',
          nickname: 'Chase Visa',
          accountNumber: '4111222233334444',
          category: 'credit_card',
        },
        selected: true,
      },
      {
        payee: {
          ...basePayee,
          id: 'pay_003',
          name: 'Wells Fargo Home Mortgage',
          nickname: 'Home Mortgage',
          accountNumber: '5500112233',
          category: 'mortgage',
        },
        selected: false,
      },
      {
        payee: {
          ...basePayee,
          id: 'pay_004',
          name: 'State Farm Insurance Co.',
          nickname: 'Auto Insurance',
          accountNumber: '7700334455',
          category: 'insurance',
        },
        selected: false,
      },
      {
        payee: {
          ...basePayee,
          id: 'pay_005',
          name: 'Monthly Gym Membership',
          nickname: 'Gym',
          accountNumber: '1122334455',
          category: 'other',
        },
        selected: false,
      },
    ];

    return (
      <div className="grid gap-3 max-w-md">
        {categories.map(({ payee, selected }) => (
          <PayeeCard key={payee.id} payee={payee} isSelected={selected} onSelect={() => {}} />
        ))}
      </div>
    );
  },
};
