import { Col, Row, Tabs } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './settings.css';
import UserManagement from './UserManagement/UserManagement';
import { useOutletContext } from 'react-router';
import WidgetSettings from './WidgetSettings/WidgetSettings';

const Settings = () => {
  const { t } = useTranslation();
  const [tabKey, setTabKey] = useState('tab1');
  const [
    // eslint-disable-next-line no-unused-vars
    _currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();

  // Set content background color
  setContentBackgroundColor('#fff');

  useEffect(() => {
    // Check if tabKey exists in sessionStorage
    const storedTabKey = sessionStorage.getItem('tabKey');
    if (storedTabKey) {
      setTabKey(storedTabKey);
    }
  }, []);

  const onTabChange = (key) => {
    // Update tabKey in sessionStorage on tab change
    sessionStorage.setItem('tabKey', key);
    setTabKey(key);
  };

  const items = [
    { label: t('dashboard.settings.tab1'), key: 'tab1', children: <UserManagement /> },
    { label: t('dashboard.settings.tab2'), key: 'tab2', children: <WidgetSettings /> },
  ];

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <Row className="settings-wrapper">
        <Col span={24}>
          <h4 className="settings-heading" data-cy="heading-settings-title">
            {t('dashboard.settings.heading')}
          </h4>
        </Col>
        <Col span={24}>
          <Tabs items={items} activeKey={tabKey} onChange={onTabChange} />
        </Col>
      </Row>
    </FeatureFlag>
  );
};

export default Settings;
