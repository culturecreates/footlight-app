import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const inviteApi = createApi({
  reducerPath: 'inviteApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 10,
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getInviteDetails: builder.query({
      query: ({ id }) => {
        return {
          url: `invite/${id}`,
          method: 'GET',
        };
      },
      transformResponse: (response) => response.data,
    }),

    inviteUser: builder.mutation({
      query: ({
        firstName,
        lastName,
        email,
        role,
        calendarId,
        language = 'FR',
        organizationIds = [],
        peopleIds = [],
      }) => {
        return {
          url: `invite`,
          method: 'POST',
          headers: {
            'calendar-id': calendarId,
            language: language,
          },
          body: { firstName, lastName, email, role, organizationIds, peopleIds },
        };
      },
      invalidatesTags: (result, error, arg) => [{ type: 'Users', id: arg._id }],
    }),

    acceptInvite: builder.mutation({
      query: ({ id, password }) => {
        return {
          url: `invite/${id}/accept`,
          method: 'POST',
          body: { ...(password && { password }) },
        };
      },
    }),

    withDrawInvitation: builder.mutation({
      query: ({ id, calendarId }) => {
        return {
          url: `invite/${id}/withdraw`,
          method: 'POST',
          headers: {
            'calendar-id': calendarId,
          },
        };
      },
    }),
  }),
});

export const {
  useGetInviteDetailsQuery,
  useAcceptInviteMutation,
  useLazyGetInviteDetailsQuery,
  useInviteUserMutation,
  useWithDrawInvitationMutation,
} = inviteApi;
