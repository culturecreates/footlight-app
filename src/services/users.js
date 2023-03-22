import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ includeInactiveUsers, includeCalendarFilter, calendarId }) => {
        return {
          url: `users?includeInactiveUsers=${includeInactiveUsers}&includeCalendarFilter=${includeCalendarFilter}`,
          method: 'GET',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
    }),
    getUserRoles: builder.query({
      query: () => `users/roles`,
    }),
    getCurrentUser: builder.query({
      query: ({ calendarId }) => {
        return {
          url: `users/current`,
          method: 'GET',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
    }),
    updateCurrentUser: builder.mutation({
      query: ({ calendarId, body }) => {
        return {
          url: `users/current`,
          method: 'PATCH',
          headers: {
            'calendar-id': calendarId,
          },
          body,
        };
      },
    }),
    forgotPassword: builder.mutation({
      query: ({ email, language }) => {
        return {
          url: `users/recover-password`,
          method: 'PATCH',
          headers: {
            language: language,
          },
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
export const {
  useGetUserRolesQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} = usersApi;
