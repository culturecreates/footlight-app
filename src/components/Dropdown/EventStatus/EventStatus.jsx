import React from 'react';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';

function EventStatusOptions({ children }) {
  const { t } = useTranslation();
  const items = eventPublishOptions.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      label: t(item.label),
    };
  });
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
