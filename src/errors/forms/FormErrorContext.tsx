import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FieldError {
  message: string;
  type: string;
}

interface FormErrorState {
  fieldErrors: Map<string, FieldError[]>;
  formError: string | null;
  isSubmitting: boolean;
}

interface FormErrorContextValue {
  state: FormErrorState;
  setFieldError: (field: string, error: FieldError) => void;
  setFieldErrors: (errors: Record<string, FieldError[]>) => void;
  clearFieldError: (field: string) => void;
  setFormError: (error: string | null) => void;
  clearAllErrors: () => void;
  getFieldError: (field: string) => FieldError | undefined;
  hasFieldError: (field: string) => boolean;
  setSubmitting: (isSubmitting: boolean) => void;
}

const FormErrorContext = createContext<FormErrorContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useFormErrorContext(): FormErrorContextValue {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormErrorContext must be used within FormErrorProvider');
  }
  return context;
}

interface FormErrorProviderProps {
  children: ReactNode;
}

export function FormErrorProvider({ children }: FormErrorProviderProps): ReactNode {
  const [state, setState] = useState<FormErrorState>({
    fieldErrors: new Map(),
    formError: null,
    isSubmitting: false,
  });

  const setFieldError = useCallback((field: string, error: FieldError) => {
    setState((prev) => {
      const newErrors = new Map(prev.fieldErrors);
      const existing = newErrors.get(field) ?? [];
      newErrors.set(field, [...existing, error]);
      return { ...prev, fieldErrors: newErrors };
    });
  }, []);

  const setFieldErrors = useCallback((errors: Record<string, FieldError[]>) => {
    setState((prev) => {
      const newErrors = new Map(Object.entries(errors));
      return { ...prev, fieldErrors: newErrors };
    });
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setState((prev) => {
      const newErrors = new Map(prev.fieldErrors);
      newErrors.delete(field);
      return { ...prev, fieldErrors: newErrors };
    });
  }, []);

  const setFormError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, formError: error }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fieldErrors: new Map(),
      formError: null,
    }));
  }, []);

  const getFieldError = useCallback(
    (field: string): FieldError | undefined => {
      const errors = state.fieldErrors.get(field);
      return errors?.[0];
    },
    [state.fieldErrors],
  );

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return state.fieldErrors.has(field);
    },
    [state.fieldErrors],
  );

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  const value: FormErrorContextValue = {
    state,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    setFormError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    setSubmitting,
  };

  return <FormErrorContext.Provider value={value}>{children}</FormErrorContext.Provider>;
}
