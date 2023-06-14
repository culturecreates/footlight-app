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
  }),
});

export const { useAddOrganizationMutation } = organizationApi;
