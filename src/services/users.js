import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getUserRoles: builder.query({
      query: () => `users/roles`,
    }),
    forgotPassword: builder.mutation({
      query: (email) => {
        return {
          url: `users/recover-password`,
          method: 'PATCH',
          body: { email },
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (body) => {
        return {
          url: `users/reset-password`,
          method: 'PATCH',
          body,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserRolesQuery, useForgotPasswordMutation, useResetPasswordMutation } = usersApi;
