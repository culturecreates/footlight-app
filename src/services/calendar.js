import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Calendar'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllCalendars: builder.query({
      query: () => 'calendars',
    }),
    getCalendar: builder.query({
      query: ({ id }) => `calendars/${id}`,
    }),
    updateCalendar: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: `calendars/${calendarId}`,
        method: 'PATCH',
        body: data,
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
  }),
});

export const {
  useGetAllCalendarsQuery,
  useLazyGetCalendarQuery,
  useLazyGetAllCalendarsQuery,
  useUpdateCalendarMutation,
} = calendarApi;
