import React, { cloneElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getActiveFallbackFieldsInfo, setActiveFallbackFieldsInfo } from '../redux/reducer/languageLiteralSlice';
import { contentLanguageKeyMap } from '../constants/contentLanguage';
import { languageFallbackStatusCreator } from '../utils/languageFallbackStatusCreator';

/**
 * Custom hook to modify elements components to support language fallback functionality.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {React.ReactNode[]} params.children - The child components to be modified. Must be children of MultilingualInput Component.
 * @param {Object} params.isFieldsDirty - Object indicating which form fields are dirty.
 * @param {Object} params.currentCalendarData - Data related to the current calendar.
 * @param {string[]} params.calendarContentLanguage - Array of languages used in the calendar.
 * @param {Object} params.fieldData - Collection of data for the field of each content languages.
 * @param {string[]} params.placeholderCollection - Collection of placeholder texts for each inner child.
 * @param {string[]} params.dataCyCollection - Collection of data-cy attributes for each inner child.
 * @param {Object} params.form - Form instance
 *
 * @returns {Object} The fallback status and modified children components.
 */

function useChildrenWithLanguageFallback({
  children,
  isFieldsDirty = {},
  currentCalendarData,
  calendarContentLanguage,
  fieldData,
  placeholderCollection,
  dataCyCollection,
  form,
}) {
  const dispatch = useDispatch();
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  const [fallbackStatus, setFallbackStatus] = useState(null);
  let combinedName = children
    ?.map((child) => {
      const name = child?.props?.name;
      if (!name) return '';
      if (Array.isArray(name)) return child?.props?.name.join('');
      else return name;
    })
    .join('-');

  useEffect(() => {
    if (!currentCalendarData) return;

    const currentActiveDataInFormFields = {};

    children?.map((child) => {
      const name = child?.props?.name;
      if (Array.isArray(name)) {
        const langKey = name?.length > 1 && name[1];
        if (langKey) {
          currentActiveDataInFormFields[langKey] = form.getFieldValue(name);
        }
      }
    });

    const status = languageFallbackStatusCreator({
      calendarContentLanguage,
      fieldData,
      languageFallbacks: currentCalendarData.languageFallbacks,
      isFieldsDirty,
      currentActiveDataInFormFields,
    });

    // Only update fallbackStatus if it has actually changed
    if (JSON.stringify(status) !== JSON.stringify(fallbackStatus)) {
      setFallbackStatus(status);
    }
  }, [children, isFieldsDirty]);

  useEffect(() => {
    const modifiedActiveFallbackFieldsInfo = {
      ...activeFallbackFieldsInfo,
      [combinedName]: fallbackStatus,
    };

    const fallbackActiveFlag = calendarContentLanguage.find((language) => {
      const languageKey = contentLanguageKeyMap[language];
      return fallbackStatus?.[languageKey]?.tagDisplayStatus;
    });

    const hasDirtyFields = Object.values(isFieldsDirty).some((value) => value == true);
    if (fallbackActiveFlag)
      dispatch(setActiveFallbackFieldsInfo({ data: modifiedActiveFallbackFieldsInfo, method: 'add' }));
    else if (hasDirtyFields) {
      // eslint-disable-next-line no-unused-vars
      const { [combinedName]: _, ...rest } = activeFallbackFieldsInfo;
      dispatch(setActiveFallbackFieldsInfo({ data: rest, method: 'remove' }));
    }
  }, [fallbackStatus]);

  const modifiedChildren = useMemo(() => {
    if (!children || !fallbackStatus) return children;

    return React.Children.map(children, (child, index) => {
      let modifiedChild = child;
      const innerChild = child?.props?.children;
      let propsToAdd = {};
      let innerChildPropsToAdd = {
        placeholder: placeholderCollection[index],
        'data-cy': dataCyCollection[index],
      };

      if (child?.props && !child?.props?.initialValue) {
        const fallbackInfo = fallbackStatus[contentLanguageKeyMap[child?.key]]?.fallbackLiteralValue;
        if (fallbackInfo) {
          propsToAdd.className = 'bilingual-child-with-badge';
          propsToAdd.initialValue = fallbackInfo;
        }
      }
      const combinedProps = {
        ...child.props,
        ...propsToAdd,
      };

      if (child) {
        modifiedChild = cloneElement(child, {
          ...combinedProps,
          children: cloneElement(innerChild, {
            ...innerChild.props,
            ...innerChildPropsToAdd,
          }),
        });
      }
      return modifiedChild;
    });
  }, [children, fallbackStatus]);

  return {
    fallbackStatus,
    modifiedChildren,
  };
}

export default useChildrenWithLanguageFallback;
