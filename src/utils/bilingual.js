//Function which returns the language key depending on the interface language
import { useSelector } from 'react-redux';
import { getinterfaceLanguage } from '../redux/reducer/interfaceLanguageSlice';

export const bilingual = ({ fr, en }) => {
  const interfaceLanguage = useSelector(getinterfaceLanguage);

  if (interfaceLanguage?.toLowerCase() === 'fr' && fr) return fr;
  else if (interfaceLanguage?.toLowerCase() === 'en' && en) return en;
  else if (fr && !en) return fr;
  else return en;
};
