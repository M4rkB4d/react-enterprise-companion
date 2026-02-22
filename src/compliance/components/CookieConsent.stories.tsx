import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useConsentStore } from '@/compliance/hooks/useConsentStore';
import { CookieConsent } from './CookieConsent';

/**
 * Decorator that resets the consent store state before each story renders,
 * ensuring the banner is visible.
 */
function ResetConsentState({ children }: { children: React.ReactNode }) {
  const resetConsent = useConsentStore((s) => s.resetConsent);

  useEffect(() => {
    resetConsent();
    return () => {
      // Clean up on unmount
      resetConsent();
    };
  }, [resetConsent]);

  return <>{children}</>;
}

/**
 * Decorator that sets the consent store to "already consented" state,
 * demonstrating the component returns null.
 */
function WithConsentGiven({ children }: { children: React.ReactNode }) {
  const acceptAll = useConsentStore((s) => s.acceptAll);

  useEffect(() => {
    acceptAll();
  }, [acceptAll]);

  return <>{children}</>;
}

const meta = {
  title: 'Compliance/CookieConsent',
  component: CookieConsent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ResetConsentState>
        <div className="relative min-h-[600px] bg-gray-100 p-6">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900">Enterprise Banking</h1>
            <p className="mt-2 text-gray-600">
              This is a sample page to demonstrate the cookie consent banner overlay.
            </p>
          </div>
          <Story />
        </div>
      </ResetConsentState>
    ),
  ],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlreadyConsented: Story = {
  decorators: [
    (Story) => (
      <WithConsentGiven>
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          The CookieConsent component returns null when consent has been given. No banner is
          rendered below.
        </div>
        <Story />
      </WithConsentGiven>
    ),
  ],
};

export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const WithPageContent: Story = {
  decorators: [
    (Story) => (
      <ResetConsentState>
        <div className="relative min-h-[800px] bg-white p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-gray-900">Checking Account</h2>
                <p className="mt-1 text-2xl font-bold text-green-600">$5,423.89</p>
              </div>
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-gray-900">Savings Account</h2>
                <p className="mt-1 text-2xl font-bold text-green-600">$25,000.00</p>
              </div>
            </div>
            <p className="text-gray-500">
              The overlay dims the page content when the cookie consent banner is visible.
            </p>
          </div>
          <Story />
        </div>
      </ResetConsentState>
    ),
  ],
};
