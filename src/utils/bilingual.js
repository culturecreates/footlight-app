//Function which returns the language key depending on the interface language

export const bilingual = ({ fr, en, interfaceLanguage: interfaceLanguage }) => {
  if (interfaceLanguage?.toLowerCase() === 'fr' && fr) return fr;
  else if (interfaceLanguage?.toLowerCase() === 'en' && en) return en;
  else if (fr && !en) return fr;
  else return en;
};
