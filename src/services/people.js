import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const peopleApi = createApi({
  reducerPath: 'peopleApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['People'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllPeople: builder.query({
      query: ({ calendarId, pageNumber = 1, limit = 10, query = '', sort = 'sort=asc(name.en)' }) => ({
        url: `people?page=${pageNumber}&limit=${limit}&search=${query}&${sort}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'People', id })), 'People'] : ['People'],
      transformResponse: (response) => response,
    }),
    deletePerson: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `people/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'People', id: arg.id }],
    }),
    getPerson: builder.query({
      query: ({ personId, calendarId }) => ({
        url: `people/${personId}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),

      transformResponse: (response) => response,
    }),
    addPerson: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: `people`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
  }),
});

export const {
  useLazyGetAllPeopleQuery,
  useGetAllPeopleQuery,
  useDeletePersonMutation,
  useGetPersonQuery,
  useAddPersonMutation,
  useLazyGetPersonQuery,
} = peopleApi;
