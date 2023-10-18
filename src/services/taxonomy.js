import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const taxonomyApi = createApi({
  reducerPath: 'taxonomyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['taxonomy'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllTaxonomy: builder.query({
      query: ({ calendarId, query = '', filters, page = 1, limit = 200, taxonomyClass, includeConcepts }) => ({
        url: `taxonomy?query=${query}&${filters}&page=${page}&limit=${limit}&taxonomy-class=${taxonomyClass}&include-concepts=${includeConcepts}`,
        headers: {
          'calendar-id': calendarId,
        },
      }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: 'taxonomy', id: id })), 'taxonomy'] : ['taxonomy'],
      transformResponse: (response) => response,
    }),
    getTaxonomy: builder.query({
      query: ({ id, includeConcepts, calendarId }) => ({
        url: `taxonomy/${id}?include-concepts=${includeConcepts}`,
        headers: {
          'calendar-id': calendarId,
        },
      }),
    }),
    deleteTaxonomy: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `taxonomy/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'taxonomy', id: arg.id }],
    }),
    addTaxonomy: builder.mutation({
      query: ({ body, calendarId }) => ({
        url: `taxonomy`,
        method: 'POST',
        headers: {
          'calendar-id': calendarId,
        },
        body: body,
      }),
    }),
    updateTaxonomy: builder.mutation({
      query: ({ body, calendarId, taxonomyId }) => ({
        url: `taxonomy/${taxonomyId}`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
        body: body,
      }),
    }),
  }),
});

export const {
  useGetAllTaxonomyQuery,
  useGetTaxonomyQuery,
  useLazyGetAllTaxonomyQuery,
  useLazyGetTaxonomyQuery,
  useDeleteTaxonomyMutation,
  useAddTaxonomyMutation,
  useUpdateTaxonomyMutation,
} = taxonomyApi;
