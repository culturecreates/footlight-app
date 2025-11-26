import React, { cloneElement, useEffect, useMemo, useRef } from 'react';
import { Button, Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './multilingualInput.css';
import { useTranslation } from 'react-i18next';
import LiteralBadge from '../Badge/LiteralBadge';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { useOutletContext } from 'react-router-dom';
import useChildrenWithLanguageFallback from '../../hooks/useChildrenWithLanguageFallback';
import { isDataValid } from '../../utils/MultiLingualFormItemSupportFunctions';
import MoveLeftExtra from '../../assets/icons/left.svg?react';
import MoveRightExtra from '../../assets/icons/Right.svg?react';

/**
 * MultilingualInput Component
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode[]} props.children - An array of React elements to be rendered as tab contents.
 * @param {Object} props.fieldData - An object containing the field data for different languages.
 * @param {Array<string>} props.calendarContentLanguage - An array of languages to be displayed as tabs.
 * @param {string} [props.defaultTab] - The default tab key to be selected.
 * @param {boolean} props.required - Whether the form items are required.
 * @param {Object} props.dataCyCollection - An array containing the data-cy attribute for each user interactable element eg. textarea. maintains the order of formItems.
 * @param {Object} props.isFieldsDirty - Object with keys corresponding each content language and values as boolean to check if the field is dirty.
 * @param {Object} props.placeholderCollection - An object containing the placeholder attribute for each user interactable element eg. textarea. maintains the order of formItems.
 * @param {string} props.entityId - The entity id.
 * @param {Boolean} props.skipChildModification - A boolean to skip the modification of children. Default is false. Used as a prop for multilingual text editor.
 * @param {Object} props.isLabelWarningVisible - An object containing the status of the label warning for each language only relevant if skipChildModification is true.
 * @param {Object} params.form - Form instance. Not relevent if skipChildModification is true.
 *
 * @returns {React.Element} The rendered form item components.
 */

function MultilingualInput({ children, ...rest }) {
  const {
    fieldData,
    calendarContentLanguage,
    defaultTab: defaultTabProp,
    isFieldsDirty,
    dataCyCollection,
    required,
    placeholderCollection,
    skipChildModification = false,
    isLabelWarningVisible = {},
    entityId,
    form,
  } = rest;
  const [currentCalendarData] = useOutletContext();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = React.useState(defaultTabProp);

  const { fallbackStatus = {}, modifiedChildren = children } =
    !skipChildModification &&
    useChildrenWithLanguageFallback({
      children,
      isFieldsDirty,
      currentCalendarData,
      calendarContentLanguage,
      fieldData,
      dataCyCollection,
      placeholderCollection,
      form,
    });

  const inputRefs = useRef([]);

  const enhancedChildrenWithRefs = useMemo(() => {
    return React.Children.map(modifiedChildren, (formItem, index) => {
      if (!React.isValidElement(formItem)) return formItem;

      const childInput = formItem.props?.children;
      if (!React.isValidElement(childInput)) return formItem;

      // Ensure the ref exists
      if (!inputRefs.current[index]) {
        inputRefs.current[index] = React.createRef();
      }

      const inputWithRef = cloneElement(childInput, {
        ref: inputRefs.current[index],
      });

      const newFormItem = cloneElement(formItem, {
        children: inputWithRef,
      });

      return newFormItem;
    });
  }, [modifiedChildren]);

  let labelCollection = {};
  let fallbackPromptTextCollection = {};
  let itemCollection = [];
  let defaultTab = defaultTabProp;

  if (!defaultTabProp) {
    let flag = false;
    for (let index = 0; index < calendarContentLanguage?.length; index++) {
      const langKey = contentLanguageKeyMap[calendarContentLanguage[index]];
      if (fieldData && fieldData[langKey]) {
        defaultTab = langKey;
        flag = true;
        break;
      }
    }
    if (!flag) defaultTab = contentLanguageKeyMap[calendarContentLanguage[0]];
  }

  const shouldDisplayLabel = (required, fieldData, entityId, langKey, fieldName) => {
    const hasFieldData = fieldData != null ? isDataValid(fieldData) : false;

    // Check current form value first, fall back to initial fieldData
    const currentFormValue = form?.getFieldValue(fieldName);
    const hasCurrentValue = currentFormValue !== undefined && currentFormValue !== null;
    const isFieldEmpty = hasCurrentValue
      ? !currentFormValue || currentFormValue === ''
      : !fieldData?.[langKey] || fieldData[langKey] === '';

    if (skipChildModification) {
      return isLabelWarningVisible[langKey] ?? false;
    }

    if (fallbackStatus?.[langKey]?.tagDisplayStatus) return true;

    if (entityId && isFieldEmpty) {
      return required || (!required && hasFieldData);
    }

    return false;
  };

  // Label creation for each tab
  calendarContentLanguage?.map((language, index) => {
    const langKey = contentLanguageKeyMap[language];
    const langLabel = t(`common.tab${capitalizeFirstLetter(language)}`);
    labelCollection[langKey] = langLabel;

    // Get field name from the corresponding child
    const child = React.Children.toArray(modifiedChildren)[index];
    const fieldName = child?.props?.name;

    if (shouldDisplayLabel(required, fieldData, entityId, langKey, fieldName)) {
      labelCollection[langKey] = (
        <>
          {langLabel}&nbsp;
          <WarningOutlined style={{ color: '#B59800' }} />
        </>
      );
    }
  });

  // fallback prompt text creation for each required tab
  const fallbackKeys = fallbackStatus ? Object.keys(fallbackStatus) : [];
  fallbackKeys.length > 0 &&
    fallbackKeys.forEach((key) => {
      fallbackPromptTextCollection[key] =
        fallbackStatus[key]?.fallbackLiteralKey == '?'
          ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
          : t('common.forms.languageLiterals.knownLanguagePromptText');
    });

  calendarContentLanguage?.forEach((language, index) => {
    const langKey = contentLanguageKeyMap[language];
    let tabItem = {
      label: labelCollection[langKey],
      key: langKey,
      forceRender: true,
      children: (
        <div className="bilingual-child-wrapper">
          {enhancedChildrenWithRefs[index]}
          {fallbackStatus?.[langKey]?.tagDisplayStatus && (
            <LiteralBadge
              tagTitle={fallbackStatus[langKey]?.fallbackLiteralKey}
              promptText={fallbackPromptTextCollection[langKey]}
            />
          )}
        </div>
      ),
    };
    itemCollection.push(tabItem);
  });

  // Handle circular navigation for left and right clicks
  const handleMoveLeft = () => {
    const currentIndex = itemCollection.findIndex((item) => item.key === activeKey);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : itemCollection.length - 1;
    setActiveKey(itemCollection[newIndex].key);
  };

  const handleMoveRight = () => {
    const currentIndex = itemCollection.findIndex((item) => item.key === activeKey);
    const newIndex = currentIndex < itemCollection.length - 1 ? currentIndex + 1 : 0;
    setActiveKey(itemCollection[newIndex].key);
  };

  const extraNavigationIcons = {
    left: <Button type="primary" onClick={handleMoveLeft} className="tabs-icon-extra" icon={<MoveLeftExtra />} />,
    right: <Button type="primary" onClick={handleMoveRight} icon={<MoveRightExtra />} className="tabs-icon-extra" />,
  };

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  useEffect(() => {
    if (!activeKey) return;
    if (!calendarContentLanguage || calendarContentLanguage.length === 0) return;

    const newIndex = calendarContentLanguage.findIndex((language) => contentLanguageKeyMap[language] === activeKey);

    const inputRef = inputRefs.current[newIndex];

    setTimeout(() => {
      const component = inputRef?.current;

      const textArea = component?.resizableTextArea?.textArea;

      if (textArea && typeof textArea.focus === 'function') {
        textArea.focus();

        const valueLength = textArea.value?.length ?? 0;

        // Safeguard before setting selection range
        if (typeof textArea.setSelectionRange === 'function') {
          textArea.setSelectionRange(valueLength, valueLength);
        }
      }
    }, 0);
  }, [activeKey]);

  return (
    <Tabs
      type="card"
      activeKey={activeKey}
      defaultTab={defaultTab}
      items={itemCollection}
      size="small"
      tabBarGutter="0"
      tabBarExtraContent={extraNavigationIcons}
      tabPosition="top"
      animated="false"
      onChange={handleTabChange}
      tabBarStyle={{ margin: '0' }}
      className="bilingual-input-tab"
      data-cy="bilingual-tabs"
    />
  );
}

export default MultilingualInput;
