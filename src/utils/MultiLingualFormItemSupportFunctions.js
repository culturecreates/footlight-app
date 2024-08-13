import { contentLanguageKeyMap } from '../constants/contentLanguage';
import { capitalizeFirstLetter } from './stringManipulations';

export const placeHolderCollectionCreator = ({
  calendarContentLanguage,
  placeholderBase, // The base key for the placeholder text translation.
  t, // i18n translation function.
  hasCommonPlaceHolder = false, // If true, the same key will be used for all languages. Default is false.
}) => {
  let placeholderCollection = {};

  calendarContentLanguage.map((language) => {
    const languageTranslation = t(`common.tab${capitalizeFirstLetter(language)}`);
    if (hasCommonPlaceHolder) {
      placeholderCollection[contentLanguageKeyMap[language]] = t(placeholderBase) || '';
    } else {
      placeholderCollection[contentLanguageKeyMap[language]] =
        t(placeholderBase, { language: languageTranslation }) || '';
    }
  });
  return placeholderCollection;
};

export const isDataValid = (data) => {
  return data && Object.values(data).some((value) => value && value != '');
};
