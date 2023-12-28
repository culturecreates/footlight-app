import React from 'react';
import './loginNavigationBar.css';
import OutlinedButton from '../../Button/Outlined';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function NavigationBar() {
  const { t } = useTranslation();
  const changeLanguageHandler = (lang) => {
    if (lang == 'en') {
      i18n.changeLanguage('fr');
    } else {
      i18n.changeLanguage('en');
    }
  };
  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../../assets/images/footlight-logo-small.png')}
          alt="Footlight logo"
          className="footlight-logo"
          data-cy="image-footlight-logo"
        />
        <h6 className="logo-name" data-cy="heading-footlight-title">
          Footlight
        </h6>
      </div>
      <div>
        <OutlinedButton
          data-cy="button-change-interface-language"
          size="large"
          label={t('login.changeLanguageTo')}
          onClick={() => changeLanguageHandler(i18n.language)}
        />
      </div>
    </div>
  );
}

export default NavigationBar;
