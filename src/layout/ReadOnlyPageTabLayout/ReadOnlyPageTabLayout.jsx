import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import { useDispatch } from 'react-redux';
import { setActiveTabKey } from '../../redux/reducer/readOnlyTabSlice';

// eslint-disable-next-line no-unused-vars
const ReadOnlyPageTabLayout = ({ children, ...rest }) => {
  const [currentCalendarData, , , , , ,] = useOutletContext();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  let itemCollection = [];

  calendarContentLanguage.forEach((language) => {
    const langKey = contentLanguageKeyMap[language];
    const langLabel = t(`common.tab${capitalizeFirstLetter(language)}`);
    let tabItem = {
      label: langLabel,
      key: langKey,
      forceRender: true,
      children: <div className="bilingual-child-wrapper">{children}</div>,
    };
    itemCollection.push(tabItem);
  });

  const handleTabChange = (key) => {
    dispatch(setActiveTabKey(key));
  };

  useEffect(() => {
    dispatch(setActiveTabKey(contentLanguageKeyMap[calendarContentLanguage[0]]));
  }, []);

  return (
    <Tabs
      type="card"
      items={itemCollection}
      size="medium"
      tabBarGutter="0"
      tabPosition="top"
      animated="false"
      onChange={handleTabChange}
      tabBarStyle={{ margin: '0' }}
      className="bilingual-input-tab"
      data-cy="bilingual-tabs"
    />
  );
};

export default ReadOnlyPageTabLayout;
