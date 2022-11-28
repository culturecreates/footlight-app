import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: ({ pageNumber = 1, limit, calendarId, query = '' }) => ({
        url: `events?page=${pageNumber}&limit=${limit}&query=${query}`,
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
