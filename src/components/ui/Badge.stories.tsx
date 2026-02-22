import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    dot: { control: 'boolean' },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- Variants ----------

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Active' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
};

export const Error: Story = {
  args: { variant: 'error', children: 'Overdue' },
};

// ---------- With Dot ----------

export const WithDot: Story = {
  args: { variant: 'success', dot: true, children: 'Online' },
};

// ---------- All Variants ----------

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
    </div>
  ),
};

// ---------- All Variants with Dot ----------

export const AllVariantsWithDot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default" dot>
        Inactive
      </Badge>
      <Badge variant="primary" dot>
        Info
      </Badge>
      <Badge variant="success" dot>
        Active
      </Badge>
      <Badge variant="warning" dot>
        Pending
      </Badge>
      <Badge variant="error" dot>
        Failed
      </Badge>
    </div>
  ),
};

// ---------- Sizes ----------

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge variant="primary" size="sm">
        Small
      </Badge>
      <Badge variant="primary" size="md">
        Medium
      </Badge>
      <Badge variant="primary" size="lg">
        Large
      </Badge>
    </div>
  ),
};

// ---------- Variants x Sizes Grid ----------

export const VariantsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'primary', 'success', 'warning', 'error'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-16 text-sm font-medium capitalize text-gray-600">{variant}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Badge key={`${variant}-${size}`} variant={variant} size={size} dot>
              {size.toUpperCase()}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};
