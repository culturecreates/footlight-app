import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Events'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: ({ pageNumber = 1, limit, calendarId, query = '', filterkeys, sort }) => ({
        url: `events?page=${pageNumber}&limit=${limit}&query=${query}&${sort}&${filterkeys}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'Events', id })), 'Events'] : ['Events'],
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

      transformResponse: (response) => response,
    }),
    updateEventState: builder.mutation({
      query: ({ id, calendarId, publishState = undefined }) => ({
        url: `events/${id}/toggle-publish?publishState=${publishState ?? ''}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Events', id: arg.id }],
    }),
    deleteEvent: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `events/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Events', id: arg.id }],
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
    featureEvents: builder.mutation({
      query: ({ eventIds, state, calendarId }) => ({
        url: `events/toggle-featured?${eventIds}&state=${state}`,
        method: 'PUT',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Events', id: arg.id }],
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
      invalidatesTags: (result, error, arg) => [{ type: 'Events', id: arg.id }],
    }),
  }),
});

export const {
  useLazyGetEventsQuery,
  useLazyGetEventQuery,
  useUpdateEventStateMutation,
  useDeleteEventMutation,
  useAddEventMutation,
  useGetEventQuery,
  useUpdateEventMutation,
  useFeatureEventsMutation,
} = eventsApi;
