import React from 'react';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import ProtectedComponents from '../../../layout/ProtectedComponents';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useDeleteEventMutation, useUpdateEventStateMutation } from '../../../services/events';
import { useParams } from 'react-router-dom';

function EventStatusOptions({ children, publishState, creator, eventId }) {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const [updateEventState] = useUpdateEventStateMutation();
  const [deleteEvent] = useDeleteEventMutation();
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
  const onClick = ({ key }) => {
    if (key == '2') deleteEvent({ id: eventId, calendarId: calendarId });
    else if (key === '0' || key === '1') updateEventState({ id: eventId, calendarId: calendarId });
  };
  return (
    <ProtectedComponents creator={creator}>
      <Dropdown
        className="calendar-dropdown-wrapper"
        menu={{
          items,
          onClick,
        }}
        trigger={['click']}>
        {children}
      </Dropdown>
    </ProtectedComponents>
  );
}

export default EventStatusOptions;
