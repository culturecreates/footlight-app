import React from 'react';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import './eventStatus.css';

function EventStatusOptions({ children }) {
  const { t } = useTranslation();

  const items = [
    {
      label: t('dashboard.events.publishOptions.publishEvent'),
      key: '0',
    },
    {
      label: t('dashboard.events.publishOptions.unpublishEvent'),
      key: '1',
    },

    {
      label: t('dashboard.events.publishOptions.deleteEvent'),
      key: '2',
    },
  ];
  return (
    <Dropdown
      className="calendar-dropdown-wrapper"
      menu={{
        items,
      }}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default EventStatusOptions;
