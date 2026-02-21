import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';

const meta = {
  title: 'Form/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    children: (
      <input
        type="email"
        placeholder="you@example.com"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    ),
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    error: 'Please enter a valid email address',
    children: (
      <input
        type="email"
        defaultValue="not-an-email"
        className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
    ),
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name *',
    children: (
      <input
        type="text"
        required
        placeholder="John Doe"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    ),
  },
};

export const WithSelectInput: Story = {
  args: {
    label: 'Country',
    children: (
      <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option value="">Select a country</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
      </select>
    ),
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Description',
    children: (
      <textarea
        rows={3}
        placeholder="Enter a description..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    ),
  },
};
