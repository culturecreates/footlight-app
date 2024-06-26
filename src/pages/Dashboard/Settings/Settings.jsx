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
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { useSearchParams } from 'react-router-dom';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';

const Settings = () => {
  const { t } = useTranslation();
  const [tabKey, setTabKey] = useState();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { user } = useSelector(getUserDetails);
  let [searchParams, setSearchParams] = useSearchParams();
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
    let initialTabKey;
    const tabKeyInParms = searchParams.get('tab');

    if (tabKeyInParms) {
      sessionStorage.setItem('tabKey', tabKeyInParms);
      initialTabKey = tabKeyInParms;
    } else {
      initialTabKey = sessionStorage.getItem('tabKey') || '1';
      sessionStorage.setItem('tabKey', initialTabKey);
    }

    if (initialTabKey != '1' && initialTabKey != '2' && initialTabKey != '3' && initialTabKey != '4')
      initialTabKey = '1';

    setTabKey(initialTabKey);
  }, []);

  const onTabChange = (key) => {
    // Update tabKey in sessionStorage on tab change
    if (isFormDirty) {
      const confirm = window.confirm(`${t('common.unsavedChanges')}`);
      if (confirm) {
        sessionStorage.setItem('tabKey', key);
        setSearchParams({ tab: key });
        setTabKey(key);
        setIsFormDirty(false);
      }
    } else {
      sessionStorage.setItem('tabKey', key);
      setSearchParams({ tab: key });
      setTabKey(key);
      setIsFormDirty(false);
    }
  };

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const items = [
    {
      label: t('dashboard.settings.tab1'),
      key: '1',
      children: <UserManagement tabKey={tabKey} />,
      disabled: false,
      adminOnly: false,
    },
    {
      label: t('dashboard.settings.tab2'),
      key: '2',
      children: (
        <WidgetSettings
          tabKey={tabKey}
          setDirtyStatus={() => {
            if (!isFormDirty) setIsFormDirty(true);
          }}
        />
      ),
      disabled: false,
      adminOnly: true,
    },
    {
      label: t('dashboard.settings.tab3'),
      key: '3',
      children: currentCalendarData && (
        <CalendarSettings
          tabKey={tabKey}
          setDirtyStatus={() => {
            if (!isFormDirty) setIsFormDirty(true);
          }}
        />
      ),
      disabled: false,
      adminOnly: true,
    },
    {
      label: t('dashboard.settings.tab4'),
      key: '4',
      children: (
        <MandatoryFields
          tabKey={tabKey}
          setDirtyStatus={() => {
            if (!isFormDirty) setIsFormDirty(true);
          }}
        />
      ),
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
      <RouteLeavingGuard isBlocking={isFormDirty} />
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
