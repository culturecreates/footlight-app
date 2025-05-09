import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const imageApi = createApi({
  reducerPath: 'imageApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    addImage: builder.mutation({
      query: ({ data, calendarId, imageUrl }) => ({
        url: `images`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
        params: {
          imageUrl,
        },
      }),
    }),
  }),
});

export const { useAddImageMutation } = imageApi;
