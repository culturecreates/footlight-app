import React, { useEffect, cloneElement, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { contentLanguage } from '../../constants/contentLanguage';
import { languageFallbackSetup } from '../../utils/languageFallbackSetup';

function ContentLanguageInput(props) {
  const { children, calendarContentLanguage } = props;
  // eslint-disable-next-line no-unused-vars
  const [currentCalendarData, _pageNumber, _setPageNumber, _getCalendar] = useOutletContext();

  const fallbackStatus = languageFallbackSetup(
    currentCalendarData,
    children?.props?.fieldData,
    currentCalendarData.languageFallbacks,
  );

  const [modifiedChildren, setModifiedChildren] = useState(null);

  useEffect(() => {
    let modifiedChildren = React.Children.map(children, (child) => {
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

    setModifiedChildren(modifiedChildren);
  }, []);

  if (!modifiedChildren) {
    return children;
  }

  if (calendarContentLanguage === contentLanguage.FRENCH)
    return (
      <>
        {modifiedChildren[0]?.props?.children?.filter(
          (child) => child?.key?.replace(/[.$]/g, '') === contentLanguage.FRENCH,
        )}
      </>
    );
  else if (calendarContentLanguage === contentLanguage.ENGLISH)
    return (
      <>
        {modifiedChildren[0]?.props?.children?.filter(
          (child) => child?.key?.replace(/[.$]/g, '') === contentLanguage.ENGLISH,
        )}
      </>
    );
  else if (calendarContentLanguage === contentLanguage.BILINGUAL) return <>{modifiedChildren[0]}</>;
  else return <>{modifiedChildren[0]}</>;
}

export default ContentLanguageInput;
