import { contentLanguageKeyMap } from '../constants/contentLanguage';

export const placeHolderCollectionCreator = ({
  calendarContentLanguage,
  placeholderBase,
  t,
  postfixFillerText = '',
}) => {
  let placeholderCollection = {};
  calendarContentLanguage.map((language) => {
    placeholderCollection[contentLanguageKeyMap[language]] =
      t(placeholderBase + language.toLowerCase() + postfixFillerText) || '';
  });
  return placeholderCollection;
};

export const isDataValid = (data) => {
  return data && Object.values(data).some((value) => value && value != '');
};
