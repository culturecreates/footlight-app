import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import LiteralBadge from '../Badge/LiteralBadge';
import { getActiveFallbackFieldsInfo, setActiveFallbackFieldsInfo } from '../../redux/reducer/languageLiteralSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveTabKey } from '../../redux/reducer/readOnlyTabSlice';
import './fallbackInjectorForReadOnlyPages.css';
import { useTranslation } from 'react-i18next';
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import { useOutletContext } from 'react-router-dom';
import { contentLanguageBilingual } from '../../utils/bilingual';

/**
 * FallbackInjectorForReadOnlyPages Component
 *
 * @param {Object} props - The properties object.
 * @param {(processedData: any) => React.ReactNode} props.children - function that receives the processed data and returns a React node to be displayed.
 * @param {string} props.fieldName - The name of the field for which fallback information is to be displayed.
 * @param {Object} props.currentCalendarData - The current calendar's data, including language fallback mappings and additional metadata.
 * @param {Object} props.calendarContentLanguage - An array that contains content languages of the calendar.
 * @param {Object} props.data - The field data for which the fallback status needs to be calculated and displayed.
 *@param {string} props.languageKey - The language key for active tab.
 *
 * @returns {React.Element} The rendered component displaying children content and a fallback badge if applicable.
 *
 * @description
 * The `FallbackInjectorForReadOnlyPages` component is designed for use in read-only pages requiring multilingual field
 * fallback information. This component conditionally displays a `LiteralBadge` with appropriate fallback prompts.
 *
 * Key Features:
 * - Dynamically generates fallback prompt text based on the active fallback field information in Redux.
 * - Updates Redux state with modified fallback field info using the `languageFallbackStatusCreator` utility.
 * - Displays a fallback badge (`LiteralBadge`) if a field has a fallback status to notify users about potential
 *   missing or alternative language data.
 */

const FallbackInjectorForReadOnlyPages = (props) => {
  const { children = <></>, fieldName, data, languageKey } = props;

  const [currentCalendarData] = useOutletContext();
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const langKey = useSelector(getActiveTabKey);
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [fallbackPromptTextCollection, setFallbackPromptTextCollection] = useState({});

  useEffect(() => {
    // fallback prompt text creation for each required tab
    if (activeFallbackFieldsInfo[fieldName]) {
      const fallbackKeys = Object.keys(activeFallbackFieldsInfo[fieldName]);
      if (fallbackKeys.length > 0) {
        const updatedCollection = {};
        fallbackKeys.forEach((key) => {
          updatedCollection[key] =
            activeFallbackFieldsInfo[key]?.fallbackLiteralKey === '?'
              ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
              : t('common.forms.languageLiterals.knownLanguagePromptText');
        });
        setFallbackPromptTextCollection(updatedCollection);
      }
    }
  }, [activeFallbackFieldsInfo, currentCalendarData]);

  useEffect(() => {
    if (!data || !currentCalendarData) return;

    const fallbackStatus = languageFallbackStatusCreator({
      calendarContentLanguage,
      fieldData: data,
      languageFallbacks: currentCalendarData.languageFallbacks,
      isFieldsDirty: {},
      currentActiveDataInFormFields: data,
    });

    const modifiedActiveFallbackFieldsInfo = {
      ...activeFallbackFieldsInfo,
      ...fallbackStatus,
    };

    dispatch(setActiveFallbackFieldsInfo({ data: { [fieldName]: modifiedActiveFallbackFieldsInfo }, method: 'add' }));
  }, [data, currentCalendarData]);

  return (
    <Row className="readonly-data-wrapper">
      <Col>
        {typeof children === 'function'
          ? children(
              contentLanguageBilingual({
                calendarContentLanguage,
                data,
                requiredLanguageKey: activeFallbackFieldsInfo[fieldName]?.[langKey]?.fallbackLiteralKey ?? languageKey,
              }),
            )
          : children}
      </Col>
      {activeFallbackFieldsInfo[fieldName]?.[langKey]?.tagDisplayStatus && (
        <Col className="literal-badge-wrapper">
          <LiteralBadge
            tagTitle={activeFallbackFieldsInfo[fieldName]?.[langKey]?.fallbackLiteralKey}
            promptText={fallbackPromptTextCollection?.[langKey]}
          />
        </Col>
      )}
    </Row>
  );
};

export default FallbackInjectorForReadOnlyPages;
