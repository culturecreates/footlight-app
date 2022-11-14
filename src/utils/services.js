import { fetchBaseQuery } from '@reduxjs/toolkit/query';

export const baseQuery = fetchBaseQuery({
  baseUrl: 'http://3.96.80.223:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().user.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
