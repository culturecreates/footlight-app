import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const artsDataApi = createApi({
  reducerPath: 'artsDataApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_ARTS_DATA_URI }),
  endpoints: (builder) => ({
    getArtsDataEntities: builder.query({
      query: ({ searchKeyword, entityType }) => `/recon?query=${searchKeyword}&type=schema:${entityType}`,
    }),
  }),
});

export const { useGetArtsDataEntitiesQuery, useLazyGetArtsDataEntitiesQuery } = artsDataApi;
