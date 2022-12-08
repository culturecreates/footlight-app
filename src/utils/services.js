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
  if (result.error && result.error.status === 401) api.dispatch(clearUser());
  if (result?.meta?.response && result?.meta?.response.status === 503) {
    notification.info({
      message: <Translation>{(t) => t('common.server.status.503.message')}</Translation>,
      description: <Translation>{(t) => t('common.server.status.503.description')}</Translation>,
      placement: 'top',
    });
  }

  return result;
};
