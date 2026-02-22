import { useState, useEffect, useCallback } from 'react';
import { errorNotificationService } from './ErrorNotificationService';
import type { ErrorNotification } from '../types';

interface UseErrorNotificationsReturn {
  notifications: ErrorNotification[];
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export function useErrorNotifications(): UseErrorNotificationsReturn {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = errorNotificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          errorNotificationService.dismiss(notification.id);
        }, notification.duration);
      }
    });

    // Load existing notifications
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronous initialization from external service on mount
    setNotifications(errorNotificationService.getActiveNotifications());

    return unsubscribe;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    errorNotificationService.dismiss(id);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    errorNotificationService.clearAll();
  }, []);

  return { notifications, dismiss, clearAll };
}
