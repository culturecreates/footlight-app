import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const taxonomyApi = createApi({
  reducerPath: 'taxonomyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['taxonomy'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllTaxonomy: builder.query({
      query: ({ calendarId, search = '', taxonomyClass, includeConcepts, page = 1, limit = 200 }) => ({
        url: `taxonomy?search=${search}&taxonomy-class=${taxonomyClass}&include-concepts=${includeConcepts}&page=${page}&limit=${limit}`,
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
    getTaxonomy: builder.query({
      query: ({ id, includeConcepts, calendarId }) => ({
        url: `taxonomy/${id}?include-concepts=${includeConcepts}`,
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
  }),
});

export const { useGetAllTaxonomyQuery, useGetTaxonomyQuery, useLazyGetAllTaxonomyQuery, useLazyGetTaxonomyQuery } =
  taxonomyApi;
