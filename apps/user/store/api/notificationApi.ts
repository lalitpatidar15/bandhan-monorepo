import { baseApi } from './baseApi';
import { NotificationResponse } from '@/types/notification';

export const notificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({ 
    // Get user notifications
    getNotifications: builder.query<NotificationResponse, { limit?: number; offset?: number }>({
      query: ({ limit = 20, offset = 0 }) => `/notifications?limit=${limit}&offset=${offset}`,
      providesTags: ['Dashboard'],
    }),

    // Get unread notifications
    getUnreadNotifications: builder.query<NotificationResponse, void>({
      query: () => '/notifications/unread',
      providesTags: ['Dashboard'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationApi;
