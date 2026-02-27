import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const externalSourceApi = createApi({
  reducerPath: 'externalSourceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ExternalSource'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getExternalSource: builder.query({
      query: ({
        searchKey,
        classes,
        calendarId,
        excludeExistingCMS = true,
        sources = 'sources=Artsdata',
        isStrict = true,
      }) => ({
        url: `entities/search?query=${encodeURIComponent(
          searchKey,
        )}&${classes}&${sources}&exclude-existing-cms-entities=${excludeExistingCMS}&is-strict=${isStrict}`,
        method: 'GET',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      extraOptions: { skipGlobalErrorHandling: true },
      transformResponse: (response) => response,
    }),
  }),
});

export const { useLazyGetExternalSourceQuery, useGetExternalSourceQuery } = externalSourceApi;
