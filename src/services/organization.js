import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['organization'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    addOrganization: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: 'organizations',
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
      query: ({ calendarId, sort }) => ({
        url: `organizations?${sort}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
  }),
});

export const { useAddOrganizationMutation, useLazyGetOrganizationQuery, useLazyGetAllOrganizationQuery } =
  organizationApi;
