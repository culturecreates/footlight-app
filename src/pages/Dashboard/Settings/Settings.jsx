import { Col, Row, Tabs } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './settings.css';
import UserManagement from './UserManagement/UserManagement';

const Settings = () => {
  const { t } = useTranslation();
  const [tabKey, setTabKey] = useState('tab1');

  const onTabChange = (key) => {
    setTabKey(key);
  };

  const items = [
    { label: t('dashboard.settings.tab1'), key: 'tab1', children: <UserManagement /> },
    { label: t('dashboard.settings.tab2'), key: 'tab2', children: 'Coming soon' },
  ];

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <Row className="settings-wrapper">
        <Col span={24}>
          <h4 className="settings-heading">{t('dashboard.settings.heading')}</h4>
        </Col>
        <Col span={24}>
          <Tabs items={items} activeKey={tabKey} onChange={onTabChange} />
        </Col>
      </Row>
    </FeatureFlag>
  );
};

export default Settings;