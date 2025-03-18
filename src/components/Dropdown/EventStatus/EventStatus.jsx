import React from 'react';
import { Dropdown, Modal, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import ProtectedComponents from '../../../layout/ProtectedComponents';
import { eventPublishState } from '../../../constants/eventPublishState';
import {
  useDeleteEventMutation,
  useFeatureEventsMutation,
  useUpdateEventStateMutation,
} from '../../../services/events';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
const { confirm } = Modal;
function EventStatusOptions({ children, publishState, creator, eventId, isFeatured, eventData, ...rest }) {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [, , , , , isReadOnly] = useOutletContext();
  const [updateEventState] = useUpdateEventStateMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [featureEvents] = useFeatureEventsMutation();

  const items = eventPublishOptions.map((item) => {
    if (publishState == eventPublishState.PUBLISHED) {
      if (item.key != '0' && item.key != '6') {
        if (isFeatured) {
          if (item.key !== '4') {
            return {
              key: item?.key,
              label: item?.label,
              type: item?.type,
            };
          }
        } else {
          if (item.key !== '5') {
            return {
              key: item?.key,
              label: item?.label,
              type: item?.type,
            };
          }
        }
      }
    } else {
      if (publishState == eventPublishState.DRAFT || publishState === eventPublishState.PENDING_REVIEW)
        if (item.key != '1' && item.key !== '5' && item.key !== '4') {
          if (item.key === '6') {
            if (publishState === eventPublishState.PENDING_REVIEW)
              return {
                key: item?.key,
                label: item?.label,
                type: item?.type,
              };
          } else
            return {
              key: item?.key,
              label: item?.label,
              type: item?.type,
            };
        }
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
    else if (key === '0' || key === '1' || key === '6') {
      updateEventState({
        id: eventId,
        calendarId: calendarId,
        publishState:
          key === '6' || key === '1' ? eventPublishState.DRAFT : key === '0' ? eventPublishState.PUBLISHED : undefined,
      })
        .unwrap()
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    } else if (key === '3') navigate(`${location.pathname}${PathName.AddEvent}?duplicateId=${eventId}`);
    else if (key === '4' || key === '5') {
      featureEvents({
        eventIds: `eventIds=${eventData?.id}`,
        calendarId,
      })
        .unwrap()
        .then((res) => {
          if (res?.statusCode == 202) {
            notification.success({
              description: t('dashboard.events.addEditEvent.notification.updateEvent'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  return (
    <ProtectedComponents creator={creator} isReadOnly={isReadOnly}>
      <Dropdown
        {...rest}
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
