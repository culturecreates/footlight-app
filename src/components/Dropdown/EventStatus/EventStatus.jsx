import React from 'react';
import { Dropdown, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import ProtectedComponents from '../../../layout/ProtectedComponents';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useDeleteEventMutation, useUpdateEventStateMutation } from '../../../services/events';
import { useParams } from 'react-router-dom';
const { confirm } = Modal;
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
          label: item.label,
        };
    } else {
      if (publishState == eventPublishState.DRAFT || publishState === eventPublishState.PENDING_REVIEW)
        if (item.key != '1')
          return {
            key: item.key,
            label: item.label,
          };
    }
  });
  const showDeleteConfirm = () => {
    confirm({
      title: t('dashboard.events.deleteEvent.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('dashboard.events.deleteEvent.description'),
      okText: t('dashboard.events.deleteEvent.ok'),
      okType: 'danger',
      cancelText: t('dashboard.events.deleteEvent.cancel'),
      className: 'delete-modal-container',
      onOk() {
        deleteEvent({ id: eventId, calendarId: calendarId });
      },
    });
  };
  const onClick = ({ key }) => {
    if (key == '2') showDeleteConfirm();
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
