import React, { useState } from 'react';
import './navigationBar.css';
import OutlinedButton from '../Button/Outlined';
import { setInterfaceLanguage } from '../../redux/reducer/interfaceLanguageSlice';
import { useDispatch } from 'react-redux';
import i18n from 'i18next';

function NavigationBar() {
  const dispatch = useDispatch();
  const [changeLanguageTo, setchangeLanguageTo] = useState('Français');
  const changeLanguageHandler = (event) => {
    if (event.target.outerText === 'Français') {
      dispatch(setInterfaceLanguage('fr'));
      i18n.changeLanguage('fr');
      setchangeLanguageTo('English');
    } else {
      dispatch(setInterfaceLanguage('en'));
      i18n.changeLanguage('en');
      setchangeLanguageTo('Français');
    }
  };
  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../assets/images/footlight-logo-small.png')}
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
