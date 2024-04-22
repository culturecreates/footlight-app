import React, { cloneElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { languageFallbackSetup } from '../utils/languageFallbackSetup';
import { getActiveFallbackFieldsInfo, setActiveFallbackFieldsInfo } from '../redux/reducer/languageLiteralSlice';
import { contentLanguage } from '../constants/contentLanguage';

function useModifyChildernWithFallbackLanguage(props, currentCalendarData) {
  const { children, isFieldsDirty } = props;
  const dispatch = useDispatch();
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  const [fallbackStatus, setFallbackStatus] = useState(null);

  useEffect(() => {
    if (!currentCalendarData) return;

    const status = languageFallbackSetup({
      currentCalendarData,
      fieldData: children?.props?.fieldData,
      languageFallbacks: currentCalendarData.languageFallbacks,
      isFieldsDirty: isFieldsDirty,
    });

    // Only update fallbackStatus if it has actually changed
    if (JSON.stringify(status) !== JSON.stringify(fallbackStatus)) {
      setFallbackStatus(status);
    }
  }, [children, isFieldsDirty]);

  useEffect(() => {
    const combinedName = children?.props?.children
      ?.map((child) => {
        if (child?.props?.name) return child?.props?.name;
        if (child?.props?.formName) return child?.props?.formName;
        else return '';
      })
      .join('-');

    const modifiedActiveFallbackFieldsInfo = {
      ...activeFallbackFieldsInfo,
      [combinedName]: fallbackStatus,
    };

    if (fallbackStatus?.fr?.tagDisplayStatus || fallbackStatus?.en?.tagDisplayStatus) {
      dispatch(setActiveFallbackFieldsInfo(modifiedActiveFallbackFieldsInfo));
    } else if (isFieldsDirty?.en || isFieldsDirty?.fr) {
      // eslint-disable-next-line no-unused-vars
      const { [combinedName]: _, ...rest } = activeFallbackFieldsInfo;
      dispatch(setActiveFallbackFieldsInfo(rest));
    }
  }, [fallbackStatus]);

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
                className: 'bilingual-child-with-badge',
                initialValue: fallbackStatus['fr']?.fallbackLiteralValue,
              });
            } else if (innerChild?.key === contentLanguage.ENGLISH && !innerChild?.props?.initialValue) {
              modifiedInnerChild = cloneElement(innerChild, {
                ...innerChild.props,
                className: 'bilingual-child-with-badge',
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

  return {
    fallbackStatus,
    modifiedChildren,
  };
}

export default useModifyChildernWithFallbackLanguage;
