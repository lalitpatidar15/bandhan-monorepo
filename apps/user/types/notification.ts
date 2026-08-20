export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'booking' | 'message' | 'payment' | 'promotion' | 'job' | 'shipping' | 'system';
  read: boolean;
  createdAt: string;
  relatedId?: string;
  referenceId?: string;
  referenceModel?: string;
  redirectUrl?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
  read: boolean;
}
