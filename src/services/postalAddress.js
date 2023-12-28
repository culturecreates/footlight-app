import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const postalAddressApi = createApi({
  reducerPath: 'postalAddressApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PostalAddress'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    addPostalAddress: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: `postal-addresses`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
    updatePostalAddress: builder.mutation({
      query: ({ data, calendarId, id }) => ({
        url: `postal-addresses/${id}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
  }),
});

export const { useAddPostalAddressMutation, useUpdatePostalAddressMutation } = postalAddressApi;
