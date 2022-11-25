import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../utils/services';
export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getAllCalendars: builder.query({
      query: () => 'calendars',
    }),
  }),
});

export const { useGetAllCalendarsQuery } = calendarApi;
