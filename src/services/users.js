import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../utils/services';
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getUserRoles: builder.query({
      query: () => `users/roles`,
    }),
    forgotPassword: builder.mutation({
      query: (email) => {
        return {
          url: `users/forgot-password`,
          method: 'POST',
          body: { email },
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserRolesQuery, useForgotPasswordMutation } = usersApi;
