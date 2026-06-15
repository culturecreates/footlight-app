import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';
import en from '../locales/en/translationEn.json';
import fr from '../locales/fr/transalationFr.json';

const getInitialLanguage = () => {
  const savedLanguage = Cookies.get('interfaceLanguage')?.toLowerCase();
  if (savedLanguage === 'fr') return 'fr';
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});
