import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const peopleApi = createApi({
  reducerPath: 'peopleApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['People'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllPeople: builder.query({
      query: ({ calendarId }) => ({
        url: `people`,
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
  }),
});

export const { useLazyGetAllPeopleQuery, useGetAllPeopleQuery, useDeletePersonMutation } = peopleApi;
