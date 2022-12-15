import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Events', 'Event'],
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
    getEvent: builder.query({
      query: ({ eventId, calendarId }) => ({
        url: `events/${eventId}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: ['Event'],
      transformResponse: (response) => response,
    }),
    updateEventState: builder.mutation({
      query: ({ eventId, calendarId }) => ({
        url: `events/${eventId}/toggle-publish`,
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
    }),
    updateEvent: builder.mutation({
      query: ({ data, calendarId, eventId }) => ({
        url: `events/${eventId}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useLazyGetEventsQuery,
  useUpdateEventStateMutation,
  useDeleteEventMutation,
  useAddEventMutation,
  useGetEventQuery,
  useUpdateEventMutation,
} = eventsApi;
