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
