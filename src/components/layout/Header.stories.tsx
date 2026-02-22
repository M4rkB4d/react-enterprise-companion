import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './Header';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

/**
 * Helper decorator component that sets auth state before rendering.
 */
function WithAuthUser({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser({
      id: 'usr_001',
      email: 'jane.doe@enterprise.bank',
      name: 'Jane Doe',
      roles: ['admin'],
      permissions: ['read', 'write'],
    });
    return () => {
      useAuthStore.getState().logout();
    };
  }, [setUser]);

  return <>{children}</>;
}

function WithNoUser({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().logout();
  }, []);

  return <>{children}</>;
}

const meta = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  decorators: [
    (Story) => (
      <WithAuthUser>
        <Story />
      </WithAuthUser>
    ),
  ],
};

export const LoggedOut: Story = {
  decorators: [
    (Story) => (
      <WithNoUser>
        <Story />
      </WithNoUser>
    ),
  ],
};

export const DarkBackground: Story = {
  decorators: [
    (Story) => (
      <WithAuthUser>
        <div className="dark bg-gray-900 p-4">
          <Story />
        </div>
      </WithAuthUser>
    ),
  ],
};
