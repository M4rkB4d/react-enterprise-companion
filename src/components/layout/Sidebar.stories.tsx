import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { Sidebar } from './Sidebar';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <Story />
          <div className="flex-1 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">Main content area</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnDashboard: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <Story />
          <div className="flex-1 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">Dashboard page content</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};

export const OnAccountsPage: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/accounts']}>
        <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <Story />
          <div className="flex-1 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">Accounts page content</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};

export const OnPaymentsPage: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/payments']}>
        <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <Story />
          <div className="flex-1 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">Payments page content</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};

export const OnAuditPage: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/audit']}>
        <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <Story />
          <div className="flex-1 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">Audit log page content</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};
