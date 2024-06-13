import Cookies from 'js-cookie';

export const removeCachedData = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('calendarId');
  Cookies.remove('interfaceLanguage');
  Cookies.remove('error');
  localStorage.removeItem('persist:root');
  sessionStorage.clear();
};
