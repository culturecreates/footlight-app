import React from 'react';
import { Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './multilingualInput.css';
import { useTranslation } from 'react-i18next';
import LiteralBadge from '../Badge/LiteralBadge';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { useOutletContext } from 'react-router-dom';
import useChildrenWithLanguageFallback from '../../hooks/useChildrenWithLanguageFallback';

/**
 * MultilingualInput Component
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode[]} props.children - An array of React elements to be rendered as tab contents.
 * @param {Object} props.fieldData - An object containing the field data for different languages.
 * @param {Array<string>} props.calendarContentLanguage - An array of languages to be displayed as tabs.
 * @param {string} [props.defaultTab] - The default tab key to be selected.
 * @param {Object} props.dataCyCollection - An array containing the data-cy attribute for each user interactable element eg. textarea. maintains the order of formItems.
 * @param {Object} props.isFieldsDirty - Object with keys corresponding each content language and values as boolean to check if the field is dirty.
 * @param {Object} props.placeholderCollection - An object containing the placeholder attribute for each user interactable element eg. textarea. maintains the order of formItems.
 * @param {Boolean} props.skipChildModification - A boolean to skip the modification of children. Default is false. Used as a prop for multilingual text editor.
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
    placeholderCollection,
    skipChildModification = false,
  } = rest;
  const [currentCalendarData] = useOutletContext();
  const { t } = useTranslation();

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
    });

  let labelCollection = {};
  let fallbackPromptTextCollection = {};
  let itemCollection = [];
  let defaultTab = defaultTabProp;

  if (!defaultTabProp) {
    let flag = false;
    for (let index = 0; index < calendarContentLanguage.length; index++) {
      const langKey = contentLanguageKeyMap[calendarContentLanguage[index]];
      if (fieldData && fieldData[langKey]) {
        defaultTab = langKey;
        flag = true;
        break;
      }
    }
    if (!flag) defaultTab = contentLanguageKeyMap[calendarContentLanguage[0]];
  }

  // label creation for each tab
  calendarContentLanguage.map((language) => {
    const langKey = contentLanguageKeyMap[language];
    const langLabel = t(`common.tab${capitalizeFirstLetter(language)}`);
    labelCollection[langKey] = langLabel;

    if (!fieldData) return;

    if (!fieldData[langKey] || fieldData[langKey] == '') {
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

  calendarContentLanguage.forEach((language, index) => {
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

  return (
    <Tabs
      type="card"
      defaultActiveKey={defaultTab}
      items={itemCollection}
      size="small"
      tabBarGutter="0"
      tabPosition="top"
      animated="false"
      tabBarStyle={{ margin: '0' }}
      className="bilingual-input-tab"
      data-cy="bilingual-tabs"
    />
  );
}

export default MultilingualInput;
