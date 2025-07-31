import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
import { messageStatusMap } from '../constants/notificationConstants';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ calendarId, sinceNdays, messageType }) => ({
        url: 'messages',
        headers: {
          'calendar-id': calendarId,
          ...(sinceNdays ? { 'since-n-days': sinceNdays } : {}),
          ...(messageType ? { 'message-type': messageType } : {}),
        },
      }),
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
        url: `messages/${messageId}/mark-as-read`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
  }),
});

export const { useGetNotificationsQuery, useLazyGetNotificationsQuery, useMarkAsReadMutation } = notificationApi;
