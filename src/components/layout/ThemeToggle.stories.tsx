import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '@/stores/themeStore';
import { useEffect } from 'react';

const meta = {
  title: 'Layout/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  decorators: [
    (Story) => {
      const { setTheme } = useThemeStore();
      useEffect(() => {
        setTheme('light');
      }, [setTheme]);
      return <Story />;
    },
  ],
};

export const Dark: Story = {
  decorators: [
    (Story) => {
      const { setTheme } = useThemeStore();
      useEffect(() => {
        setTheme('dark');
      }, [setTheme]);
      return (
        <div className="rounded-lg bg-gray-800 p-4">
          <Story />
        </div>
      );
    },
  ],
};
