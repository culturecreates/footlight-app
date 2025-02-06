import React from 'react';
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
import { ReactComponent as MoveLeftExtra } from '../../assets/icons/left.svg';
import { ReactComponent as MoveRightExtra } from '../../assets/icons/Right.svg';

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

  const shouldDisplayLabel = (required, fieldData, entityId, langKey) => {
    const hasFieldData = fieldData != null ? isDataValid(fieldData) : false;
    const isFieldEmpty = !fieldData?.[langKey] || fieldData[langKey] === '';

    if (skipChildModification) {
      return isLabelWarningVisible[langKey] ?? false;
    }

    if (entityId && isFieldEmpty) {
      return required || (!required && hasFieldData);
    }

    return false;
  };

  // Label creation for each tab
  calendarContentLanguage?.map((language) => {
    const langKey = contentLanguageKeyMap[language];
    const langLabel = t(`common.tab${capitalizeFirstLetter(language)}`);
    labelCollection[langKey] = langLabel;

    if (shouldDisplayLabel(required, fieldData, entityId, langKey)) {
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
          {modifiedChildren[index]}
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
