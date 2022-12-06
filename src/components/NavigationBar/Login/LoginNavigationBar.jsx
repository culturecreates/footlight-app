import React, { useState } from 'react';
import './loginNavigationBar.css';
import OutlinedButton from '../../Button/Outlined';
import { setInterfaceLanguage } from '../../../redux/reducer/interfaceLanguageSlice';
import { useDispatch } from 'react-redux';
import { locale } from '../../../constants/localeSupport';
import i18n from 'i18next';
import Cookies from 'js-cookie';

function NavigationBar() {
  const dispatch = useDispatch();
  const [changeLanguageTo, setchangeLanguageTo] = useState(
    Cookies.get('interfaceLanguage') === locale.FRENCH.key ? locale.ENGLISH.label : locale.FRENCH.label,
  );

  const changeLanguageHandler = (event) => {
    if (event.target.outerText === locale.FRENCH.label) {
      dispatch(setInterfaceLanguage(locale.FRENCH.key));
      i18n.changeLanguage(locale.FRENCH.key);
      setchangeLanguageTo(locale.ENGLISH.label);
    } else {
      dispatch(setInterfaceLanguage(locale.ENGLISH.key));
      i18n.changeLanguage(locale.ENGLISH.key);
      setchangeLanguageTo(locale.FRENCH.label);
    }
  };
  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../../assets/images/footlight-logo-small.png')}
          alt="Footlight logo"
          className="footlight-logo"
        />
        <h6 className="logo-name">Footlight</h6>
      </div>
      <div>
        <OutlinedButton label={changeLanguageTo} onClick={(event) => changeLanguageHandler(event)} />
      </div>
    </div>
  );
}

export default NavigationBar;
