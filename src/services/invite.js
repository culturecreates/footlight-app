import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
export const inviteApi = createApi({
  reducerPath: 'inviteApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 10,
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

    acceptInvite: builder.mutation({
      query: ({ id, password }) => {
        return {
          url: `invite/${id}/accept`,
          method: 'POST',
          body: { ...(password && { password }) },
        };
      },
    }),
  }),
});

export const { useGetInviteDetailsQuery, useAcceptInviteMutation, useLazyGetInviteDetailsQuery } = inviteApi;
