import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const taxonomyApi = createApi({
  reducerPath: 'taxonomyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['taxonomy'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllTaxonomy: builder.query({
      query: ({ calendarId, search = '', taxonomyClass, includeConcepts }) => ({
        url: `taxonomy?search=${search}&taxonomy-class=${taxonomyClass}&include-concepts=${includeConcepts}`,
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
    getTaxonomy: builder.query({
      query: ({ id }) => `taxonomy/${id}`,
    }),
  }),
});

export const { useGetAllTaxonomyQuery, useGetTaxonomyQuery } = taxonomyApi;
