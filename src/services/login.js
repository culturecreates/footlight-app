import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../utils/services';
import Cookies from 'js-cookie';
import { setUser } from '../redux/reducer/userSlice';
import { handleLogin } from '../hooks/useAuth';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        Cookies.set('accessToken', response.accessToken);
        Cookies.set('refreshToken', response.refreshToken.token);
        handleLogin({
          userInfo: response?.user,
          accessToken: response?.accessToken,
          refreshToken: response?.accessToken,
        });

        return response;
      },
      async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
        const { data } = await cacheDataLoaded;
        if (data) {
          dispatch(setUser(data));
        }
      },
    }),
  }),
});

export const { useLoginMutation } = loginApi;
