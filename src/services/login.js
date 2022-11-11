import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../utils/services';
export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials
      })
    })
  })
});

export const { useLoginMutation } = loginApi;
