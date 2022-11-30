import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';
import i18n from 'i18next';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { setInterfaceLanguage } from './redux/reducer/interfaceLanguageSlice';

function App() {
  const dispatch = useDispatch();

  const language = Cookies.get('interfaceLanguage');
  if (language) {
    dispatch(setInterfaceLanguage(language));
    i18n.changeLanguage(language);
  }

  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  );
}

export default App;
