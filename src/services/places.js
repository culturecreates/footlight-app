import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const placesApi = createApi({
  reducerPath: 'placesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Places'],
  endpoints: (builder) => ({
    getAllPlaces: builder.query({
      query: ({ calendarId }) => ({
        url: `places?excludeContainsPlace=true`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: ['Places'],
      transformResponse: (response) => response,
    }),
  }),
});

export const { useLazyGetAllPlacesQuery, useGetAllPlacesQuery } = placesApi;
