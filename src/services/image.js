import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const imageApi = createApi({
  reducerPath: 'imageApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    addImage: builder.mutation({
      query: ({ data, calendarId }) => ({
        url: 'images',
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: data,
      }),
    }),
  }),
});

export const { useAddImageMutation } = imageApi;
