import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
import { messageStatusMap } from '../constants/notificationConstants';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ calendarId, sinceNdays, messageType }) => {
        let url = `messages`;

        const params = new URLSearchParams();
        if (messageType) params.append('message-type', messageType);
        if (sinceNdays) params.append('since-n-days', sinceNdays);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        return {
          url,
          headers: {
            'calendar-id': calendarId,
          },
        };
      },

      transformResponse: (response) => {
        const unreadCount = response?.data?.filter((item) => item.messageStatus === messageStatusMap.SENT).length || 0;
        return {
          notifications: response?.data,
          unreadCount,
          lastUpdated: new Date().toISOString(),
        };
      },

      keepUnusedDataFor: 30,
    }),
    markAsRead: builder.mutation({
      query: ({ calendarId, messageId }) => ({
        url: `messages/mark-as-read?ids=${messageId}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
    createNotification: builder.mutation({
      query: ({ calendarId, notificationData }) => ({
        url: 'messages',
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: notificationData,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
  useCreateNotificationMutation,
} = notificationApi;
