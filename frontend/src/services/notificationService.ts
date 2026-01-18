// PWA Notification Service
class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.initializePermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializePermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return 'denied';
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  async showNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      requireInteraction?: boolean;
      actions?: NotificationAction[];
    } = {}
  ): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    };

    // Use Service Worker registration for better compatibility
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, defaultOptions);
        return;
      }
    }

    // Fallback to regular notification
    new Notification(title, defaultOptions);
  }

  async showAlertNotification(alertType: 'critical' | 'warning' | 'info', message: string) {
    let title = '';
    const icon = '/pwa-192x192.png';
    let requireInteraction = false;

    switch (alertType) {
      case 'critical':
        title = '🚨 Critical Alert - RootGuard';
        requireInteraction = true;
        break;
      case 'warning':
        title = '⚠️ Warning - RootGuard';
        break;
      case 'info':
        title = 'ℹ️ Info - RootGuard';
        break;
    }

    await this.showNotification(title, {
      body: message,
      icon,
      tag: `alert-${alertType}`,
      requireInteraction,
      actions: [
        {
          action: 'view',
          title: 'View Dashboard'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  async showIrrigationNotification(action: 'started' | 'stopped', mode: string) {
    const title = action === 'started' 
      ? '💧 Irrigation Started' 
      : '🛑 Irrigation Stopped';
    
    await this.showNotification(title, {
      body: `Irrigation ${action} in ${mode.toUpperCase()} mode`,
      tag: 'irrigation-status',
      actions: [
        {
          action: 'view',
          title: 'View Dashboard'
        }
      ]
    });
  }

  async showSystemNotification(message: string) {
    await this.showNotification('🔧 System Update', {
      body: message,
      tag: 'system-status'
    });
  }
}

export const notificationService = NotificationService.getInstance();

// Hook for using notifications in React components
export const useNotifications = () => {
  const requestPermission = () => notificationService.requestPermission();
  const showAlert = (type: 'critical' | 'warning' | 'info', message: string) => 
    notificationService.showAlertNotification(type, message);
  const showIrrigation = (action: 'started' | 'stopped', mode: string) => 
    notificationService.showIrrigationNotification(action, mode);
  const showSystem = (message: string) => 
    notificationService.showSystemNotification(message);

  return {
    isSupported: notificationService.isSupported(),
    hasPermission: notificationService.hasPermission(),
    requestPermission,
    showAlert,
    showIrrigation,
    showSystem
  };
};