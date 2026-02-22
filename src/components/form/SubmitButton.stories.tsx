import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';
import { SubmitButton } from './SubmitButton';

/**
 * Wrapper that provides a react-hook-form context with configurable
 * `isSubmitting` state for story demonstration.
 */
function FormWrapper({
  isSubmitting = false,
  children,
}: {
  isSubmitting?: boolean;
  children: React.ReactNode;
}) {
  const methods = useForm();

  // Override formState to control isSubmitting in stories
  const overriddenMethods = {
    ...methods,
    formState: {
      ...methods.formState,
      isSubmitting,
    },
  };

  return (
    <FormProvider {...overriddenMethods}>
      <form onSubmit={(e) => e.preventDefault()}>{children}</form>
    </FormProvider>
  );
}

const meta = {
  title: 'Form/SubmitButton',
  component: SubmitButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <FormWrapper>
        <Story />
      </FormWrapper>
    ),
  ],
  args: {
    children: 'Submit',
  },
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Save Changes' },
};

export const Submitting: Story = {
  decorators: [
    (Story) => (
      <FormWrapper isSubmitting>
        <Story />
      </FormWrapper>
    ),
  ],
  args: { children: 'Save Changes' },
};

export const SubmittingCustomText: Story = {
  decorators: [
    (Story) => (
      <FormWrapper isSubmitting>
        <Story />
      </FormWrapper>
    ),
  ],
  args: {
    children: 'Create Account',
    loadingText: 'Creating account\u2026',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Submit',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <FormWrapper>
        <SubmitButton>Ready to Submit</SubmitButton>
      </FormWrapper>
      <FormWrapper isSubmitting>
        <SubmitButton>Save Changes</SubmitButton>
      </FormWrapper>
      <FormWrapper>
        <SubmitButton disabled>Disabled</SubmitButton>
      </FormWrapper>
      <FormWrapper isSubmitting>
        <SubmitButton loadingText="Processing payment\u2026">Pay Now</SubmitButton>
      </FormWrapper>
    </div>
  ),
};
