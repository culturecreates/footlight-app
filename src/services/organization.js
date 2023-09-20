import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Organization'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    addOrganization: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: `organizations`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
    getOrganization: builder.query({
      query: ({ id, calendarId }) => ({
        url: `organizations/${id}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
    getAllOrganization: builder.query({
      query: ({ calendarId, pageNumber = 1, limit = 10, query = '', sort = 'sort=asc(name.en)' }) => ({
        url: `organizations?page=${pageNumber}&limit=${limit}&search=${query}&${sort}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'Organization', id })), 'Organization'] : ['Organization'],
      transformResponse: (response) => response,
    }),
    deleteOrganization: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `organizations/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Organization', id: arg.id }],
    }),
    updateOrganization: builder.mutation({
      query: ({ data, calendarId, organizationId }) => ({
        url: `organizations/${organizationId}`,
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
  useAddOrganizationMutation,
  useLazyGetOrganizationQuery,
  useGetOrganizationQuery,
  useLazyGetAllOrganizationQuery,
  useDeleteOrganizationMutation,
  useUpdateOrganizationMutation,
} = organizationApi;
