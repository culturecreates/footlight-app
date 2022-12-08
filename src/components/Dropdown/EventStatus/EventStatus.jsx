import React from 'react';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import ProtectedComponents from '../../../layout/ProtectedComponents';
import { eventPublishState } from '../../../constants/eventPublishState';

function EventStatusOptions({ children, publishState, creator }) {
  const { t } = useTranslation();
  const items = eventPublishOptions.map((item) => {
    if (publishState == eventPublishState.PUBLISHED) {
      if (item.key != '0')
        return {
          key: item.key,
          label: t(item.label),
        };
    } else {
      if (publishState == eventPublishState.DRAFT || publishState === eventPublishState.PENDING_REVIEW)
        if (item.key != '1')
          return {
            key: item.key,
            label: t(item.label),
          };
    }
  });

  return (
    <ProtectedComponents creator={creator}>
      <Dropdown
        className="calendar-dropdown-wrapper"
        menu={{
          items,
        }}
        trigger={['click']}>
        {children}
      </Dropdown>
    </ProtectedComponents>
  );
}

export default EventStatusOptions;
