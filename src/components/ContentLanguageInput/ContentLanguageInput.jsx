import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { contentLanguage } from '../../constants/contentLanguage';
import LiteralBadge from '../Badge/LiteralBadge';
import { useTranslation } from 'react-i18next';
import useModifyChildernWithFallbackLanguage from '../../hooks/useModifyChildernWithFallbackLanguage';

function ContentLanguageInput(props) {
  const { children, calendarContentLanguage } = props;
  const { t } = useTranslation();

  // eslint-disable-next-line no-unused-vars
  const [currentCalendarData, _pageNumber, _setPageNumber, _getCalendar] = useOutletContext();

  const { fallbackStatus, modifiedChildren } = useModifyChildernWithFallbackLanguage(props, currentCalendarData);

  if (!modifiedChildren) return children;

  if (calendarContentLanguage === contentLanguage.FRENCH) {
    const promptText =
      fallbackStatus?.fr?.fallbackLiteralKey === '?'
        ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
        : t('common.forms.languageLiterals.knownLanguagePromptText');
    return (
      <>
        {modifiedChildren[0]?.props?.children?.filter(
          (child) => child?.key?.replace(/[.$]/g, '') === contentLanguage.FRENCH,
        )}
        {fallbackStatus?.fr?.tagDisplayStatus && (
          <LiteralBadge tagTitle={fallbackStatus?.fr?.fallbackLiteralKey} promptText={promptText} />
        )}
      </>
      // add literal badge to the fr children
    );
  } else if (calendarContentLanguage === contentLanguage.ENGLISH) {
    const promptText =
      fallbackStatus?.en?.fallbackLiteralKey === '?'
        ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
        : t('common.forms.languageLiterals.knownLanguagePromptText');
    return (
      <>
        {modifiedChildren[0]?.props?.children?.filter(
          (child) => child?.key?.replace(/[.$]/g, '') === contentLanguage.ENGLISH,
        )}
        {fallbackStatus?.en?.tagDisplayStatus && (
          <LiteralBadge tagTitle={fallbackStatus?.en?.fallbackLiteralKey} promptText={promptText} />
        )}
      </>
      // add literal badge to the en children
    );
  } else if (calendarContentLanguage === contentLanguage.BILINGUAL) return <>{modifiedChildren[0]}</>;
  else return <>{modifiedChildren[0]}</>;
  // for bilingual, return the children as is, literal is added in BilingualInput component
}

export default ContentLanguageInput;
