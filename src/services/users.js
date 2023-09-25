import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users'],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ includeCalenderFilter, calendarId, query = '', page = 1, limit, filters }) => {
        return {
          url: `users?includeCalendarFilter=${includeCalenderFilter}&${filters}&query=${query}&page=${page}&limit=${limit}`,
          method: 'GET',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
      providesTags: (result) =>
        result ? [...result.data.map(({ _id }) => ({ type: 'Users', id: _id })), 'Users'] : ['Users'],
      transformResponse: (response) => response,
    }),
    getUserRoles: builder.query({
      query: () => `users/roles`,
    }),
    getUserById: builder.query({
      query: ({ userId, calendarId }) => {
        return {
          url: `users/${userId}`,
          method: 'GET',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
    }),
    getCurrentUser: builder.query({
      query: ({ accessToken, calendarId }) => {
        return {
          url: `users/current`,
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
            'calendar-id': calendarId,
          },
        };
      },
    }),
    deleteUser: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `users/${id}`,
        method: 'DELETE',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Users', id: arg.id }],
    }),
    activateUser: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `users/${id}/activate`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Users', id: arg.id }],
    }),
    deactivateUser: builder.mutation({
      query: ({ id, calendarId }) => ({
        url: `users/${id}/deactivate`,
        method: 'PATCH',
        headers: {
          'calendar-id': calendarId,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Users', id: arg.id }],
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
    currentUserLeaveCalendar: builder.mutation({
      query: ({ calendarId }) => {
        return {
          url: `users/current/leave-calendar`,
          method: 'PATCH',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
    }),
    updateUserById: builder.mutation({
      query: ({ calendarId, id, body }) => {
        return {
          url: `users/${id}`,
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
  useGetUserByIdQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useLazyGetUserByIdQuery,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useLazyGetCurrentUserQuery,
  useLazyGetAllUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useCurrentUserLeaveCalendarMutation,
  useUpdateUserByIdMutation,
} = usersApi;
