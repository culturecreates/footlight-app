/* eslint-disable no-unused-vars */
import React, { useEffect, cloneElement, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { contentLanguage } from '../../constants/contentLanguage';
import { languageFallbackSetup } from '../../utils/languageFallbackSetup';
import LiteralBadge from '../Badge/LiteralBadge';
import { useTranslation } from 'react-i18next';

function ContentLanguageInput(props) {
  const { children, calendarContentLanguage } = props;
  const { t } = useTranslation();
  const [currentCalendarData, _pageNumber, _setPageNumber, _getCalendar] = useOutletContext();

  const [fallbackStatus, setFallbackStatus] = useState(null);

  useEffect(() => {
    if (!currentCalendarData) return;

    const status = languageFallbackSetup({
      currentCalendarData,
      fieldData: children?.props?.fieldData,
      languageFallbacks: currentCalendarData.languageFallbacks,
      isFieldsDirty: props?.isFieldsDirty,
    });

    // Only update fallbackStatus if it has actually changed
    if (JSON.stringify(status) !== JSON.stringify(fallbackStatus)) {
      setFallbackStatus(status);
    }
  }, [currentCalendarData, children, props.isFieldsDirty]);

  const modifiedChildren = useMemo(() => {
    if (!children || !fallbackStatus) return children;

    return React.Children.map(children, (child) => {
      let modifiedChild = child;

      if (child && child.props && child.props.children) {
        modifiedChild = cloneElement(child, {
          ...child.props,
          fallbackStatus: fallbackStatus,
          children: React.Children.map(child.props.children, (innerChild) => {
            let modifiedInnerChild = innerChild;
            if (innerChild?.key === contentLanguage.FRENCH && !innerChild?.props?.initialValue) {
              modifiedInnerChild = cloneElement(innerChild, {
                ...innerChild.props,
                initialValue: fallbackStatus['fr']?.fallbackLiteralValue,
              });
            } else if (innerChild?.key === contentLanguage.ENGLISH && !innerChild?.props?.initialValue) {
              modifiedInnerChild = cloneElement(innerChild, {
                ...innerChild.props,
                initialValue: fallbackStatus['en']?.fallbackLiteralValue,
              });
            }
            return modifiedInnerChild;
          }),
        });
      }
      return modifiedChild;
    });
  }, [children, fallbackStatus]);

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
      fallbackStatus?.fr?.fallbackLiteralKey === '?'
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
