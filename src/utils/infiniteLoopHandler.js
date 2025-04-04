// utils/infiniteLoopHandler.js
import Cookies from 'js-cookie';

export const infiniteLoopHandler = () => {
  let renderCount = Cookies.get('error');

  if (renderCount === undefined) {
    renderCount = 0;
  } else {
    renderCount = parseInt(renderCount, 10);
  }

  if (renderCount < 5) {
    Cookies.set('error', renderCount + 1);
    return false;
  } else {
    sessionStorage.setItem('error', renderCount + 1);
    Cookies.remove('error');
    return true; // loop detected
  }
};
