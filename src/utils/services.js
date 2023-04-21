import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { clearUser } from '../redux/reducer/userSlice';
import { notification } from 'antd';
import { Translation } from 'react-i18next';
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().user.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 400) {
    //HTTP 400 Bad Request
    //The server cannot or will not process the request due to something that is perceived to be a client error.
    notification.info({
      message: <Translation>{(t) => t('common.server.status.400.message')}</Translation>,
      placement: 'top',
      description: result.error?.data?.message,
    });
  }
  if (result.error && result.error.status === 401) {
    // HTTP 401 Unauthorized response status code
    // indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource.
    api.dispatch(clearUser());
  }
  if (result.error && result.error.status === 403) {
    // HTTP 403 Forbidden response status code indicates that the server understands the request but refuses to authorize it.
    // This status is similar to 401, but for the 403 Forbidden status code, re-authenticating makes no difference.
    // The access is tied to the application logic, such as insufficient rights to a resource.
    notification.info({
      message: <Translation>{(t) => t('common.server.status.403.message')}</Translation>,
      placement: 'top',
    });
  }
  if (result?.meta?.response && result?.meta?.response.status === 503) {
    // HTTP 503 Service Unavailable server error response code indicates that the server is not ready to handle the request.
    // Common causes are a server that is down for maintenance or that is overloaded.
    notification.info({
      message: <Translation>{(t) => t('common.server.status.503.message')}</Translation>,
      description: <Translation>{(t) => t('common.server.status.503.description')}</Translation>,
      placement: 'top',
    });
  }
  if (result.error && result.error.status === 'FETCH_ERROR') {
    // Error when the local internet is down. There is no HTTP code.
    notification.info({
      message: <Translation>{(t) => t('common.server.status.FETCH_ERROR.message')}</Translation>,
      placement: 'top',
    });
  }

  return result;
};
