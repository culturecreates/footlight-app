import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../utils/services';
export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: () => ({
        url: `/login`,
        method: 'POST',
        body: {
          email: 'email',
          password: 'password'
        }
      })
    })
  })
});

export const { useLoginMutation } = loginApi;
