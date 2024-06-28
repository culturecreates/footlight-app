import Cookies from 'js-cookie';

export const removeCachedData = () => {
  const cookieKeys = ['accessToken', 'refreshToken', 'calendarId', 'interfaceLanguage', 'error'];

  cookieKeys.forEach((key) => Cookies.remove(key));

  localStorage.removeItem('persist:root');
  sessionStorage.clear();
};
