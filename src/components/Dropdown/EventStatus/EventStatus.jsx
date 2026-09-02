import React from 'react';
import { Dropdown, Modal, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { eventPublishOptions } from '../../../constants/eventPublishOptions';
import './eventStatus.css';
import { eventPublishState } from '../../../constants/eventPublishState';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { userRoles } from '../../../constants/userRoles';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
const { confirm } = Modal;
function EventStatusOptions({
  children,
  publishState,
  creator,
  eventId,
  isFeatured,
  eventData,
  updateEventState,
  deleteEvent,
  featureEvents,
  onGetStructuredData,
  ...rest
}) {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [, , , , , isReadOnly] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);
  const canFeature = [userRoles.ADMIN, userRoles.EDITOR].includes(calendar[0]?.role) || user?.isSuperAdmin;

  // Write-action tier, reproducing the previous ProtectedComponents wrapper (super admin bypasses
  // read-only) plus the duplicate-only dropdown the list rendered for guests and non-creator
  // contributors. The dropdown itself now always renders so read actions stay available to everyone.
  const role = calendar[0]?.role;
  const isOwner = user?.id === creator?.userId;
  let writeTier; // 'all' | 'duplicateOnly' | 'none'
  if (user?.isSuperAdmin) writeTier = 'all';
  else if (isReadOnly) writeTier = 'none';
  else if (role === userRoles.ADMIN || role === userRoles.EDITOR) writeTier = 'all';
  else if (role === userRoles.CONTRIBUTOR) writeTier = isOwner ? 'all' : 'duplicateOnly';
  else if (role === userRoles.GUEST) writeTier = 'duplicateOnly';
  else writeTier = 'none';

  const publishStateItems = eventPublishOptions
    .filter((item) => canFeature || (item.key !== '4' && item.key !== '5'))
    .map((item) => {
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

  let writeItems = [];
  if (writeTier === 'all') writeItems = publishStateItems.filter(Boolean);
  else if (writeTier === 'duplicateOnly') writeItems = eventPublishOptions.filter((item) => item.key === '3');
  if (!writeItems.some((item) => item?.key)) writeItems = [];

  const copyJsonLdItem = { key: '7', label: t('dashboard.events.publishOptions.copyJsonLd') };
  const featureIndex = writeItems.findIndex((item) => item?.key === '4' || item?.key === '5');
  const dividerIndex = writeItems.findIndex((item) => item?.type === 'divider');
  const insertIndex = featureIndex !== -1 ? featureIndex + 1 : dividerIndex !== -1 ? dividerIndex : 0;

  const items = [...writeItems.slice(0, insertIndex), copyJsonLdItem, ...writeItems.slice(insertIndex)];

  const showDeleteConfirm = () => {
    confirm({
      title: <span data-cy="confirm-modal-title">{t('dashboard.events.deleteEvent.title')}</span>,
      icon: <ExclamationCircleOutlined />,
      content: <span data-cy="confirm-modal-content">{t('dashboard.events.deleteEvent.description')}</span>,
      okText: t('dashboard.events.deleteEvent.ok'),
      okType: 'danger',
      okButtonProps: { 'data-cy': 'button-confirm-ok' },
      cancelButtonProps: { 'data-cy': 'button-confirm-cancel' },
      cancelText: t('dashboard.events.deleteEvent.cancel'),
      className: 'delete-modal-container',
      onOk() {
        deleteEvent({ id: eventId, calendarId: calendarId })
          .unwrap()
          .then(() => {
            notification.success({
              description: t('dashboard.events.addEditEvent.notification.deleteEvent'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      },
    });
  };
  const onClick = ({ key }) => {
    if (key === '7') onGetStructuredData && onGetStructuredData(eventData);
    else if (key == '2') showDeleteConfirm();
    else if (key === '0' || key === '1' || key === '6') {
      const isPublishing = key === '0';
      const isUnpublishing = key === '1' || key === '6';
      updateEventState({
        id: eventId,
        calendarId: calendarId,
        publishState:
          key === '6' || key === '1' ? eventPublishState.DRAFT : key === '0' ? eventPublishState.PUBLISHED : undefined,
      })
        .unwrap()
        .then(() => {
          notification.success({
            description: t(
              isPublishing
                ? 'dashboard.events.addEditEvent.notification.publish'
                : isUnpublishing
                ? 'dashboard.events.addEditEvent.notification.saveAsDraft'
                : 'dashboard.events.addEditEvent.notification.updateEvent',
            ),
            placement: 'top',
            closeIcon: <></>,
            maxCount: 1,
            duration: 3,
          });
        })
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
  );
}

export default EventStatusOptions;
