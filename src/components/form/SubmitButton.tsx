// src/components/form/SubmitButton.tsx — Form-aware submit button (Doc 06 §17)
import { useFormContext } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

interface SubmitButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  loadingText?: string;
}

/**
 * Submit button that reads form state from React Hook Form context.
 * Automatically disables itself and shows a spinner while the form is submitting.
 *
 * Must be used inside a `<FormProvider>` (or a component wrapped with `useForm`).
 *
 * Usage:
 * ```tsx
 * <FormProvider {...methods}>
 *   <form onSubmit={methods.handleSubmit(onSubmit)}>
 *     <SubmitButton>Save Changes</SubmitButton>
 *   </form>
 * </FormProvider>
 * ```
 */
export function SubmitButton({
  children,
  loadingText = 'Submitting\u2026',
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors',
        'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {isSubmitting && <Spinner size="sm" className="text-white" />}
      {isSubmitting ? loadingText : children}
    </button>
  );
}
