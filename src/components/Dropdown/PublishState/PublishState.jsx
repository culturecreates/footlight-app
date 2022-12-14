import React from 'react';
import { Dropdown } from 'antd';
// import { useTranslation } from 'react-i18next';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useUpdateEventStateMutation } from '../../../services/events';
import { useParams } from 'react-router-dom';
function PublishState({ children, eventId }) {
  //   const { t } = useTranslation();
  const { calendarId } = useParams();
  const [updateEventState] = useUpdateEventStateMutation();
  const items = [
    {
      key: '0',
      label: eventPublishState.PUBLISHED,
    },
    {
      key: '1',
      label: eventPublishState.DRAFT,
    },
  ];

  const onClick = ({ key }) => {
    if (key === '0' || key === '1') updateEventState({ id: eventId, calendarId: calendarId });
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default PublishState;
