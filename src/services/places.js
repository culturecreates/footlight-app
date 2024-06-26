import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const placesApi = createApi({
  reducerPath: 'placesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Places'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllPlaces: builder.query({
      query: ({ calendarId, pageNumber = 1, limit = 10, query = '', sort = 'sort=asc(name.en)', filterKeys }) => ({
        url: `places?excludeContainsPlace=true&page=${pageNumber}&limit=${limit}&query=${query}&${sort}&${filterKeys}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'Places', id })), 'Places'] : ['Places'],
      transformResponse: (response) => response,
    }),
    deletePlaces: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `places/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Places', id: arg.id }],
    }),
    getPlace: builder.query({
      query: ({ placeId, calendarId }) => ({
        url: `places/${placeId}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),

      transformResponse: (response) => response,
    }),
    addPlace: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: `places`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
    updatePlace: builder.mutation({
      query: ({ data, calendarId, placeId }) => ({
        url: `places/${placeId}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
  }),
});

export const {
  useLazyGetAllPlacesQuery,
  useGetAllPlacesQuery,
  useDeletePlacesMutation,
  useLazyGetPlaceQuery,
  useGetPlaceQuery,
  useAddPlaceMutation,
  useUpdatePlaceMutation,
} = placesApi;
