import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppError, ErrorState, ErrorAction } from '../types';

const initialState: ErrorState = {
  errors: [],
  lastError: null,
  hasUnhandledError: false,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
        lastError: action.payload,
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter((e) => e.code !== action.payload),
      };
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: [],
        lastError: null,
        hasUnhandledError: false,
      };
    case 'SET_UNHANDLED_ERROR':
      return {
        ...state,
        hasUnhandledError: action.payload,
      };
    default:
      return state;
  }
}

interface ErrorContextValue {
  state: ErrorState;
  addError: (error: AppError) => void;
  removeError: (code: string) => void;
  clearAllErrors: () => void;
  setUnhandledError: (hasError: boolean) => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps): ReactNode {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: AppError) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  }, []);

  const removeError = useCallback((code: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: code });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  const setUnhandledError = useCallback((hasError: boolean) => {
    dispatch({ type: 'SET_UNHANDLED_ERROR', payload: hasError });
  }, []);

  const value: ErrorContextValue = {
    state,
    addError,
    removeError,
    clearAllErrors,
    setUnhandledError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}
