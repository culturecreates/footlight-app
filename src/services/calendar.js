import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Calendar'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllCalendars: builder.query({
      query: ({ page, limit, search, sort } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort.startsWith('sort=') ? sort.slice(5) : sort);
        const queryString = params.toString();
        return `calendars${queryString ? `?${queryString}` : ''}`;
      },
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
