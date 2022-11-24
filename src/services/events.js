import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../utils/services';
export const eventsApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (pageNumber, limit, calendarId) => ({
        url: `events?page=${pageNumber}&limit=${limit}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const { useLazyGetEventsQuery } = eventsApi;
