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
        url: `entities?query=${searchKey}&${classes}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
    getEntityDependencyDetails: builder.query({
      query: ({ id, calendarId }) => ({
        url: `entities/derived-entities?entityIds=${id}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
    getEntityDependencyCount: builder.query({
      query: ({ ids, calendarId }) => ({
        url: `entities/derived-entities/stats?entity-ids=${ids}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
    getEntitiesById: builder.query({
      query: ({ ids, calendarId }) => ({
        url: `entities/ids?${ids}`,
        method: 'GET',

        headers: {
          'calendar-id': calendarId,
        },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const {
  useLazyGetEntitiesQuery,
  useGetEntitiesQuery,
  useLazyGetEntitiesByIdQuery,
  useGetEntitiesByIdQuery,
  useLazyGetEntityDependencyCountQuery,
  useGetEntityDependencyDetailsQuery,
} = entitiesApi;
