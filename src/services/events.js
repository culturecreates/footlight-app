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
      providesTags: ['Events'],
      transformResponse: (response) => response,
    }),
    updateEventState: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `events/${id}/toggle-publish`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: ['Events'],
    }),
    deleteEvent: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `events/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: ['Events'],
    }),
    addEvent: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: 'events',
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
      invalidatesTags: ['Events'],
    }),
  }),
});

export const { useLazyGetEventsQuery, useUpdateEventStateMutation, useDeleteEventMutation, useAddEventMutation } =
  eventsApi;
