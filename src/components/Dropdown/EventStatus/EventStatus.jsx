import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import { ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import ProtectedComponents from '../../../layout/ProtectedComponents';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useDeleteEventMutation, useUpdateEventStateMutation } from '../../../services/events';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
const { confirm } = Modal;
function EventStatusOptions({ children, publishState, creator, eventId }) {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [updateEventState] = useUpdateEventStateMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const items = eventPublishOptions.map((item) => {
    if (publishState == eventPublishState.PUBLISHED) {
      if (item.key != '0')
        return {
          key: item?.key,
          label: item?.label,
          type: item?.type,
        };
    } else {
      if (publishState == eventPublishState.DRAFT || publishState === eventPublishState.PENDING_REVIEW)
        if (item.key != '1')
          return {
            key: item?.key,
            label: item?.label,
            type: item?.type,
          };
      if (item?.type === 'divider')
        return {
          key: item?.key,
          label: item?.label,
          type: item?.type,
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
    else if (key === '0' || key === '1') {
      updateEventState({ id: eventId, calendarId: calendarId })
        .unwrap()
        .then(() => {})
        .catch(() => {
          message.warning({
            duration: 10,
            maxCount: 1,
            key: 'event-review-publish-warning',
            content: (
              <>
                {t('dashboard.events.addEditEvent.validations.errorPublishing')}
                &nbsp;
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                  onClick={() => message.destroy('event-review-publish-warning')}
                />
              </>
            ),
            icon: <ExclamationCircleOutlined />,
          });
        });
    } else if (key === '3') navigate(`${location.pathname}${PathName.AddEvent}?duplicateId=${eventId}`);
  };
  return (
    <ProtectedComponents creator={creator}>
      <Dropdown
        className="calendar-dropdown-wrapper"
        overlayClassName="event-dropdown-popup"
        overlayStyle={{
          minWidth: '150px',
        }}
        getPopupContainer={(trigger) => trigger.parentNode}
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
