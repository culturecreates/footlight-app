import Cookies from 'js-cookie';

export const infiniteLoopHandler = (clearUser) => {
  let renderCount = Cookies.get('error');
  if (renderCount === undefined) {
    renderCount = 0;
  } else {
    renderCount = parseInt(renderCount, 10);
  }

  if (renderCount < 3) {
    Cookies.set('error', renderCount + 1);
  } else {
    sessionStorage.setItem('error', renderCount + 1);
    Cookies.remove('error');
    clearUser();
  }
};
