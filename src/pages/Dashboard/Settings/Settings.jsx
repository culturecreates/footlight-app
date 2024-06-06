import { Col, Row, Tabs } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './settings.css';
import UserManagement from './UserManagement/UserManagement';
import { useOutletContext, useParams } from 'react-router';
import WidgetSettings from './WidgetSettings/WidgetSettings';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import CalendarSettings from './CalendarSettings';
import MandatoryFields from './MandatoryFields';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';

const Settings = () => {
  const { t } = useTranslation();
  const [tabKey, setTabKey] = useState('tab1');
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
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

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const items = [
    {
      label: t('dashboard.settings.tab1'),
      key: 'tab1',
      children: <UserManagement />,
      disabled: false,
      adminOnly: false,
    },
    {
      label: t('dashboard.settings.tab2'),
      key: 'tab2',
      children: <WidgetSettings />,
      disabled: false,
      adminOnly: true,
    },
    {
      label: t('dashboard.settings.tab3'),
      key: 'tab3',
      children: currentCalendarData && <CalendarSettings />,
      disabled: false,
      adminOnly: true,
    },
    {
      label: t('dashboard.settings.tab4'),
      key: 'tab4',
      children: <MandatoryFields />,
      disabled: false,
      adminOnly: true,
    },
  ];

  let tabItems = items?.filter((item) => {
    if (item.adminOnly) return adminCheckHandler({ calendar, user });
    else return true;
  });
  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <Row className="settings-wrapper">
        <Col span={24}>
          <h4 className="settings-heading" data-cy="heading-settings-title">
            {t('dashboard.settings.heading')}
          </h4>
        </Col>
        <Col span={24}>
          <Tabs items={tabItems} activeKey={tabKey} onChange={onTabChange} />
        </Col>
      </Row>
    </FeatureFlag>
  );
};

export default Settings;
