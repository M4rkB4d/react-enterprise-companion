import { useCallback } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { FormValidationError, NetworkError } from '../custom-errors';
import { useFormErrorContext } from './FormErrorContext';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory } from '../types';

interface UseFormErrorHandlerReturn<T extends FieldValues> {
  handleSubmitError: (error: unknown) => void;
  handleValidationErrors: (errors: FieldErrors<T>) => void;
  clearOnChange: (fieldName: keyof T) => void;
}

export function useFormErrorHandler<T extends FieldValues>(
  formName: string,
): UseFormErrorHandlerReturn<T> {
  const { setFieldErrors, setFormError, clearFieldError, clearAllErrors } = useFormErrorContext();
  const logger = ErrorLoggingService.getInstance();

  const handleSubmitError = useCallback(
    (error: unknown) => {
      clearAllErrors();

      // Handle validation errors from API
      if (error instanceof FormValidationError) {
        const fieldErrors: Record<string, Array<{ message: string; type: string }>> = {};

        error.fieldErrors.forEach((messages, field) => {
          fieldErrors[field] = messages.map((message) => ({
            message,
            type: 'server',
          }));
        });

        setFieldErrors(fieldErrors);
        return;
      }

      // Handle network errors
      if (error instanceof NetworkError) {
        if (error.details && error.details.length > 0) {
          const fieldErrors: Record<string, Array<{ message: string; type: string }>> = {};

          error.details.forEach((detail) => {
            if (detail.field) {
              if (!fieldErrors[detail.field]) {
                fieldErrors[detail.field] = [];
              }
              fieldErrors[detail.field].push({
                message: detail.message,
                type: detail.code,
              });
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setFieldErrors(fieldErrors);
            return;
          }
        }

        setFormError(error.message);
        return;
      }

      // Handle unknown errors
      const message = error instanceof Error ? error.message : 'An error occurred';
      setFormError(message);

      logger.logError({
        error: {
          code: 'FORM_SUBMIT_ERROR',
          message,
          timestamp: new Date(),
          context: { formName },
        },
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        stackTrace: error instanceof Error ? error.stack : undefined,
        appContext: {
          component: formName,
          action: 'form_submit',
        },
      });
    },
    [clearAllErrors, setFieldErrors, setFormError, formName, logger],
  );

  const handleValidationErrors = useCallback(
    (errors: FieldErrors<T>) => {
      const fieldErrors: Record<string, Array<{ message: string; type: string }>> = {};

      Object.entries(errors).forEach(([field, error]) => {
        if (error && typeof error === 'object' && 'message' in error) {
          fieldErrors[field] = [
            {
              message: error.message as string,
              type: (error.type as string) ?? 'validation',
            },
          ];
        }
      });

      setFieldErrors(fieldErrors);
    },
    [setFieldErrors],
  );

  const clearOnChange = useCallback(
    (fieldName: keyof T) => {
      clearFieldError(fieldName as string);
    },
    [clearFieldError],
  );

  return {
    handleSubmitError,
    handleValidationErrors,
    clearOnChange,
  };
}
