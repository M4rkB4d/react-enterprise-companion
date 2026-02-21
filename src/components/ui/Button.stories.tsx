import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail } from 'lucide-react';
import { Button } from './Button';
import { Spinner } from './Spinner';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- Variants ----------

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Danger' },
};

// ---------- Sizes ----------

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Medium: Story = {
  args: { size: 'md', children: 'Medium' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

// ---------- Variants x Sizes grid ----------

export const AllVariantsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['primary', 'outline', 'ghost', 'danger'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-16 text-sm font-medium capitalize text-gray-600">{variant}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---------- States ----------

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const DisabledAllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary" disabled>
        Primary
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <Button variant="danger" disabled>
        Danger
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <Spinner size="sm" className="mr-2" />
      Loading...
    </Button>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </Button>
      <Button variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </Button>
    </div>
  ),
};
