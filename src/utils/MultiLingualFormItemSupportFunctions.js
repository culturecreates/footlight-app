import { contentLanguageKeyMap } from '../constants/contentLanguage';
import { capitalizeFirstLetter } from './stringManipulations';

export const placeHolderCollectionCreator = ({
  calendarContentLanguage,
  placeholderBase, // The base key for the placeholder text translation.
  t, // i18n translation function.
  hasCommonPlaceHolder = false, // If true, the same key will be used for all languages. Default is false.
}) => {
  let placeholderCollection = {};

  calendarContentLanguage?.map((language) => {
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

export const createInitialNamesObjectFromKeyword = (keyword, calendarContentLanguage) => {
  // for creating initial names object for each language in quick create modals
  let name = {};
  calendarContentLanguage?.forEach((language) => {
    const lanKey = contentLanguageKeyMap[language];
    name[lanKey] = keyword;
  });

  return name;
};

export const renderData = (processedData, dataCy) =>
  processedData && (
    <p className="read-only-event-content" {...(dataCy ? { 'data-cy': dataCy } : {})}>
      {processedData}
    </p>
  );
