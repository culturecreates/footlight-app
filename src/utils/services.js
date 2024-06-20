import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { clearUser, setUser } from '../redux/reducer/userSlice';
import { notification } from 'antd';
import { Translation } from 'react-i18next';
import Cookies from 'js-cookie';
import { Mutex } from 'async-mutex';
import { setErrorStates } from '../redux/reducer/ErrorSlice';

const mutex = new Mutex();
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL,
  prepareHeaders: (headers, { getState }) => {
    let token = getState().user.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    } else {
      token = Cookies.get('accessToken');
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 400) {
    //HTTP 400 Bad Request
    //The server cannot or will not process the request due to something that is perceived to be a client error.

    notification.info({
      key: '400',
      message: <Translation>{(t) => t('common.server.status.400.message')}</Translation>,
      placement: 'top',
      description: result.error?.data?.error,
    });
  }

  if (result.error && result.error.status === 500) {
    //HTTP 500 Internal Server Error
    //The server encountered an unexpected condition that prevented it from fulfilling the request
    api.dispatch(
      setErrorStates({
        errorCode: '500',
        isError: true,
        message: result.error?.data?.error,
      }),
    );

    notification.info({
      key: '500',
      message: <Translation>{(t) => t('common.server.status.500.message')}</Translation>,
      placement: 'top',
      description: result.error?.data?.error,
    });
  }
  if (result.error && result.error.status === 401) {
    // HTTP 401 Unauthorized response status code
    // indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource.
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      let refreshResult;
      let token = api.getState().user?.refreshToken?.token;
      if (!token) {
        token = Cookies.get('refreshToken');
      }
      try {
        const fetchResponse = await fetch(`${process.env.REACT_APP_API_URL}/refresh-token`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: token,
          }),
        });
        refreshResult = await fetchResponse.json();
        if (refreshResult && refreshResult?.accessToken && refreshResult?.refreshToken) {
          let user = api.getState().user.user;
          user = {
            accessToken: refreshResult?.accessToken?.token,
            expiredTime: refreshResult?.accessToken?.ttl,
            refreshToken: refreshResult?.refreshToken,
            ...user,
          };
          Cookies.set('accessToken', refreshResult?.accessToken?.token);
          Cookies.set('refreshToken', refreshResult?.refreshToken?.token);

          api.dispatch(setUser(user));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearUser());
        }
      } catch (error) {
        api.dispatch(clearUser());
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (result.error && result.error.status === 403) {
    // HTTP 403 Forbidden response status code indicates that the server understands the request but refuses to authorize it.
    // This status is similar to 401, but for the 403 Forbidden status code, re-authenticating makes no difference.
    // The access is tied to the application logic, such as insufficient rights to a resource.
    api.dispatch(setErrorStates({ errorCode: '403', isError: true, message: result.error?.data?.error }));

    notification.info({
      key: '403',
      message: <Translation>{(t) => t('common.server.status.403.message')}</Translation>,
      placement: 'top',
    });
  }
  if (result.error && result.error.status === 404) {
    // HTTP 403 Forbidden response status code indicates that the server understands the request but refuses to authorize it.
    // This status is similar to 401, but for the 403 Forbidden status code, re-authenticating makes no difference.
    // The access is tied to the application logic, such as insufficient rights to a resource.
    api.dispatch(setErrorStates({ errorCode: '404', isError: true, message: result.error?.data?.error }));

    notification.info({
      key: '404',
      message: <Translation>{(t) => t('common.server.status.403.message')}</Translation>,
      placement: 'top',
    });
  }
  if (result?.meta?.response?.status === 502) {
    // HTTP 503 Service Unavailable server error response code indicates that the server is not ready to handle the request.
    // Common causes are a server that is down for maintenance or that is overloaded.
    api.dispatch(setErrorStates({ errorCode: '503', isError: true }));
    notification.info({
      key: '503',
      message: <Translation>{(t) => t('common.server.status.503.message')}</Translation>,
      description: <Translation>{(t) => t('common.server.status.503.description')}</Translation>,
      placement: 'top',
    });
  }
  if (result.error && result.error.status === 'FETCH_ERROR') {
    // Error when the local internet is down. There is no HTTP code.

    notification.info({
      key: 'FETCH_ERROR',
      message: <Translation>{(t) => t('common.server.status.FETCH_ERROR.message')}</Translation>,
      placement: 'top',
    });
  }

  return result;
};
