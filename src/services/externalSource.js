import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const externalSourceApi = createApi({
  reducerPath: 'externalSourceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ExternalSource'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getExternalSource: builder.query({
      query: ({ searchKey, classes, calendarId, excludeExistingCMS = true, sources = 'sources=Artsdata' }) => ({
        url: `search-external-sources?query=${searchKey}&${classes}&${sources}&exclude-existing-cms-entites=${excludeExistingCMS}`, //Note: Change the source and excludeCms as per the api need
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const { useLazyGetExternalSourceQuery, useGetExternalSourceQuery } = externalSourceApi;
