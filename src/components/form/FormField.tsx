import { useId, type ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  // Clone the child input to inject the generated id and aria-describedby
  const enhancedChild = isValidElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }>(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': errorId,
        'aria-invalid': !!error,
      })
    : children;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">{enhancedChild}</div>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
