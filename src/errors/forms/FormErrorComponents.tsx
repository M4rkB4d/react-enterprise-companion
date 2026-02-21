import { type ReactNode } from 'react';
import { useFormErrorContext } from './FormErrorContext';

interface FieldErrorMessageProps {
  name: string;
  className?: string;
}

export function FieldErrorMessage({ name, className = '' }: FieldErrorMessageProps): ReactNode {
  const { getFieldError } = useFormErrorContext();
  const error = getFieldError(name);

  if (!error) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`} role="alert" aria-live="polite">
      {error.message}
    </p>
  );
}

interface FormErrorSummaryProps {
  className?: string;
  title?: string;
}

export function FormErrorSummary({
  className = '',
  title = 'Please fix the following errors:',
}: FormErrorSummaryProps): ReactNode {
  const { state } = useFormErrorContext();
  const { fieldErrors, formError } = state;

  const hasErrors = fieldErrors.size > 0 || formError;

  if (!hasErrors) return null;

  const allErrors: string[] = [];

  if (formError) {
    allErrors.push(formError);
  }

  fieldErrors.forEach((errors, field) => {
    errors.forEach((error) => {
      allErrors.push(`${field}: ${error.message}`);
    });
  });

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
            {allErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface FormFieldWrapperProps {
  name: string;
  children: ReactNode;
  label?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}

export function FormFieldWrapper({
  name,
  children,
  label,
  required,
  hint,
  className = '',
}: FormFieldWrapperProps): ReactNode {
  const { hasFieldError, getFieldError } = useFormErrorContext();
  const error = hasFieldError(name);
  const errorMessage = getFieldError(name);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        className={error ? 'rounded-md ring-2 ring-red-500' : ''}
        aria-invalid={error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {children}
      </div>

      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}

      {errorMessage && (
        <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
          {errorMessage.message}
        </p>
      )}
    </div>
  );
}
