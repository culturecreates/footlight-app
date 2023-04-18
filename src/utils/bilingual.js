//Function which returns the language key depending on the interface language

import { contentLanguage } from '../constants/contentLanguage';

export const bilingual = ({ fr, en, interfaceLanguage: interfaceLanguage }) => {
  if (interfaceLanguage?.toLowerCase() === 'fr' && fr) return fr;
  else if (interfaceLanguage?.toLowerCase() === 'en' && en) return en;
  else if (fr && !en) return fr;
  else return en;
};

export const contentLanguageBilingual = ({ fr, en, interfaceLanguage: interfaceLanguage, calendarContentLanguage }) => {
  let contentLanguageKey;
  switch (calendarContentLanguage) {
    case contentLanguage.FRENCH:
      contentLanguageKey = 'fr';
      break;
    case contentLanguage.ENGLISH:
      contentLanguageKey = 'en';
      break;
    case contentLanguage.BILINGUAL:
      contentLanguageKey = interfaceLanguage?.toLowerCase();
      break;
    default:
      contentLanguageKey = interfaceLanguage?.toLowerCase();
      break;
  }

  if (contentLanguageKey === 'fr' && fr) return fr;
  else if (contentLanguageKey === 'en' && en) return en;
  else if (fr && !en) return fr;
  else return en;
};
