import { type ReactNode, createContext, useContext, useCallback, useState } from 'react';
import { GlobalErrorBoundary } from './boundaries/GlobalErrorBoundary';
import type { AppError, ErrorNotification } from './types';

interface ErrorBoundaryContextValue {
  reportError: (error: AppError) => void;
  clearErrors: () => void;
  notifications: ErrorNotification[];
  dismissNotification: (id: string) => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useErrorBoundaryContext(): ErrorBoundaryContextValue {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundaryContext must be used within ErrorBoundaryProvider');
  }
  return context;
}

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps): ReactNode {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const reportError = useCallback((error: AppError) => {
    const notification: ErrorNotification = {
      id: crypto.randomUUID(),
      type: 'error',
      title: 'Error Occurred',
      message: error.message,
      duration: 5000,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss after duration
    if (notification.duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, notification.duration);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue: ErrorBoundaryContextValue = {
    reportError,
    clearErrors,
    notifications,
    dismissNotification,
  };

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      <GlobalErrorBoundary>
        {children}
        <ErrorNotificationContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </GlobalErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
}

interface ErrorNotificationContainerProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
}

function ErrorNotificationContainer({
  notifications,
  onDismiss,
}: ErrorNotificationContainerProps): ReactNode {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start gap-3 rounded-lg bg-red-600 p-4 text-white shadow-lg"
          role="alert"
        >
          <svg
            className="h-5 w-5 flex-shrink-0"
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
          <div className="flex-1">
            <p className="font-medium">{notification.title}</p>
            <p className="text-sm text-red-100">{notification.message}</p>
          </div>
          <button onClick={() => onDismiss(notification.id)} className="text-red-200 hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
