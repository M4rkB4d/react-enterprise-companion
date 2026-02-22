import type { AppError, ErrorNotification } from '../types';

type NotificationCallback = (notification: ErrorNotification) => void;

class ErrorNotificationServiceImpl {
  private static instance: ErrorNotificationServiceImpl;
  private subscribers: Set<NotificationCallback> = new Set();
  private notificationQueue: ErrorNotification[] = [];
  private maxQueueSize = 5;

  private constructor() {}

  static getInstance(): ErrorNotificationServiceImpl {
    if (!ErrorNotificationServiceImpl.instance) {
      ErrorNotificationServiceImpl.instance = new ErrorNotificationServiceImpl();
    }
    return ErrorNotificationServiceImpl.instance;
  }

  subscribe(callback: NotificationCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(error: AppError, options?: Partial<ErrorNotification>): void {
    const sanitizedMessage = this.sanitizeMessage(error.message);

    const notification: ErrorNotification = {
      id: crypto.randomUUID(),
      type: 'error',
      title: options?.title ?? 'Error',
      message: sanitizedMessage,
      duration: options?.duration ?? 5000,
      action: options?.action,
    };

    // Add to queue, removing oldest if at max
    if (this.notificationQueue.length >= this.maxQueueSize) {
      this.notificationQueue.shift();
    }
    this.notificationQueue.push(notification);

    // Notify all subscribers
    this.subscribers.forEach((callback) => callback(notification));
  }

  /**
   * Sanitize error messages before displaying to users.
   */
  private sanitizeMessage(message: string): string {
    if (!message || message.trim().length === 0) {
      return 'An unexpected error occurred. Please try again.';
    }

    // Strip anything after "at " (likely a stack trace fragment)
    const atIndex = message.indexOf('\n    at ');
    const cleaned = atIndex > 0 ? message.substring(0, atIndex) : message;

    // Truncate long messages
    const MAX_LENGTH = 200;
    if (cleaned.length > MAX_LENGTH) {
      return cleaned.substring(0, MAX_LENGTH) + '\u2026';
    }

    return cleaned;
  }

  getActiveNotifications(): ErrorNotification[] {
    return [...this.notificationQueue];
  }

  dismiss(id: string): void {
    this.notificationQueue = this.notificationQueue.filter((n) => n.id !== id);
  }

  clearAll(): void {
    this.notificationQueue = [];
  }
}

export const errorNotificationService = ErrorNotificationServiceImpl.getInstance();
