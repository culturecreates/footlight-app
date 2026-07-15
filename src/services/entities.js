import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const entitiesApi = createApi({
  reducerPath: 'entitiesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Entities'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getEntities: builder.query({
      query: ({ searchKey, classes, calendarId }) => ({
        url: `entities?query=${encodeURIComponent(searchKey)}&${classes}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      keepUnusedDataFor: 10,
      extraOptions: { skipGlobalErrorHandling: true },
      transformResponse: (response) => response,
    }),
    getEntityDependencyDetails: builder.query({
      query: ({ id, calendarId }) => ({
        url: `entities/reverse-links?entity-ids=${id}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
    getEntityDependencyCount: builder.query({
      query: ({ ids, calendarId }) => ({
        url: `entities/reverse-links/stats?entity-ids=${ids}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
    getEntityReverseLinksReport: builder.query({
      query: ({ ids = [], calendarId }) => {
        const defaultMessage = 'Failed to download impacted entities report.';
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const searchParams = new URLSearchParams();

        idsArray.forEach((entityId) => {
          if (entityId) {
            searchParams.append('entity-ids', entityId);
          }
        });

        return {
          url: `entities/reverse-links/report?${searchParams.toString()}`,
          method: 'GET',
          headers: {
            'calendar-id': calendarId,
          },
          responseHandler: async (response) => {
            const blob = await response.blob();

            if (!response.ok) {
              const errorText = await blob.text();
              throw new Error(errorText || response.statusText || defaultMessage);
            }

            return {
              blob,
              contentDisposition: response.headers.get('content-disposition'),
            };
          },
        };
      },
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        const defaultMessage = 'Failed to download impacted entities report.';

        return {
          ...response,
          data: typeof response?.error === 'string' ? response.error : response?.data || defaultMessage,
        };
      },
    }),
    getEntitiesById: builder.query({
      query: ({ ids, calendarId }) => ({
        url: `entities/ids?${ids}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => {
        return Array.isArray(response) ? response : [];
      },
    }),
  }),
});

export const {
  useLazyGetEntitiesQuery,
  useGetEntitiesQuery,
  useLazyGetEntitiesByIdQuery,
  useGetEntitiesByIdQuery,
  useLazyGetEntityDependencyCountQuery,
  useLazyGetEntityDependencyDetailsQuery,
  useLazyGetEntityReverseLinksReportQuery,
} = entitiesApi;
