import React, { useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import './list.css';
import { List, Grid, Dropdown } from 'antd';
import { MoreOutlined, StarOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';
import EventStatusOptions from '../../Dropdown/EventStatus/EventStatus';
import { useTranslation } from 'react-i18next';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import Username from '../../Username/index';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import { dateTypes } from '../../../constants/dateTypes';
import { userRoles } from '../../../constants/userRoles';
import { eventStatus } from '../../../constants/eventStatus';
import moment from 'moment-timezone';
import { LinkOutlined, StarFilled } from '@ant-design/icons';

const { useBreakpoint } = Grid;

function Lists(props) {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, pageNumber, setPageNumber, calendarContentLanguage } = props;
  let { calendarId } = useParams();
  const lang = i18n.language;
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData, , , , , isReadOnly] = useOutletContext();
  const totalCount = data?.totalCount;

  const [selectedItemId, setSelectedItemId] = useState(null);

  let calendar = user?.roles?.filter((calendar) => {
    return calendar?.calendarId === calendarId;
  });
  calendar = calendar?.length > 0 ? calendar : [];

  let artsDataLinkChecker = (data) => {
    return data?.sameAs?.filter((item) => item?.type === 'ArtsdataIdentifier');
  };
  const aspectRatioString = currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio;

  const listItemHandler = (id, creatorId, publishState) => {
    if (routinghandler(user, calendarId, creatorId, publishState, false, isReadOnly))
      navigate(`${location.pathname}${PathName.AddEvent}/${id}`);
    else navigate(`${location.pathname}/${id}`);
  };
  return (
    <List
      className="event-list-wrapper"
      itemLayout={!screens.md ? 'vertical' : 'horizontal'}
      dataSource={data?.data}
      bordered={false}
      pagination={{
        onChange: (page) => {
          setPageNumber(page);
        },
        pageSize: 10,
        hideOnSinglePage: true,
        total: totalCount,
        current: Number(pageNumber),
        showSizeChanger: false,
      }}
      renderItem={(eventItem, index) => (
        <List.Item
          className="event-list-item-wrapper"
          key={index}
          actions={[
            calendar[0]?.role === userRoles.GUEST ||
            (calendar[0]?.role === userRoles.CONTRIBUTOR && eventItem?.creator?.userId != user?.id) ? (
              !isReadOnly && (
                <Dropdown
                  className="calendar-dropdown-wrapper"
                  onOpenChange={(open) => {
                    if (open) setSelectedItemId(eventItem?.id);
                    else setSelectedItemId(null);
                  }}
                  overlayStyle={{
                    minWidth: '150px',
                  }}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  menu={{
                    items: [
                      {
                        key: '0',
                        label: t('dashboard.events.publishOptions.duplicateEvent'),
                      },
                    ],
                    onClick: ({ key }) => {
                      if (key === '0')
                        navigate(`${location.pathname}${PathName.AddEvent}?duplicateId=${eventItem?.id}`);
                    },
                  }}
                  trigger={['click']}>
                  <span>
                    <MoreOutlined
                      className="event-list-more-icon"
                      style={{ color: selectedItemId === eventItem?.id && '#1B3DE6' }}
                      key={index}
                    />
                  </span>
                </Dropdown>
              )
            ) : (
              <EventStatusOptions
                onOpenChange={(open) => {
                  if (open) setSelectedItemId(eventItem?.id);
                  else setSelectedItemId(null);
                }}
                key={index}
                publishState={eventItem?.publishState}
                isFeatured={eventItem?.isFeatured}
                eventData={eventItem}
                creator={eventItem?.creator}
                eventId={eventItem?.id}>
                <span>
                  <MoreOutlined
                    className="event-list-more-icon"
                    style={{ color: selectedItemId === eventItem?.id && '#1B3DE6' }}
                    key={index}
                  />
                </span>
              </EventStatusOptions>
            ),
          ]}
          extra={[
            <span key={index} className="event-list-options-responsive">
              <EventStatusOptions
                key={index}
                publishState={eventItem?.publishState}
                eventData={eventItem}
                isFeatured={eventItem?.isFeatured}
                creator={eventItem?.creator}
                eventId={eventItem?.id}>
                <span>
                  <MoreOutlined className="event-list-more-icon-responsive" key={index} />
                </span>
              </EventStatusOptions>
            </span>,
          ]}>
          <List.Item.Meta
            className="event-list-item-meta"
            onClick={() => listItemHandler(eventItem?.id, eventItem?.creator?.userId, eventItem?.publishState)}
            avatar={
              <>
                {screens.md && (
                  <div className="event-list-image-wrapper">
                    {(calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) && eventItem?.isFeatured && (
                      <div className="image-featured-badge">
                        <StarOutlined
                          style={{ fontSize: '12px', color: '#FFFFFF', position: 'absolute', top: '15%', left: '10%' }}
                        />
                      </div>
                    )}
                    <img
                      src={eventItem?.image?.thumbnail?.uri}
                      className="event-list-image"
                      style={{
                        border:
                          (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) &&
                          eventItem?.isFeatured &&
                          '3px solid #1B3DE6',
                        ...(aspectRatioString && { maxWidth: '150px' }),
                      }}
                      data-cy="image-event-thumbnail"
                    />
                  </div>
                )}
              </>
            }
            title={
              <div className="event-list-title">
                <span className="event-list-title-heading" data-cy="span-start-date-time">
                  {(eventItem?.startDate || eventItem?.startDateTime) &&
                    moment
                      .tz(
                        eventItem?.startDate ?? eventItem?.startDateTime,
                        eventItem?.scheduleTimezone ?? 'Canada/Eastern',
                      )
                      .locale(lang)
                      .format('DD-MMM-YYYY')
                      ?.toUpperCase()}

                  {dateTimeTypeHandler(
                    eventItem?.startDate,
                    eventItem?.startDateTime,
                    eventItem?.endDate,
                    eventItem?.endDateTime,
                  ) === dateTypes.RANGE && (
                    <>
                      &nbsp;{t('dashboard.events.list.to')}&nbsp;
                      {moment
                        .tz(
                          eventItem?.endDate ?? eventItem?.endDateTime,
                          eventItem?.scheduleTimezone ?? 'Canada/Eastern',
                        )
                        .locale(lang)
                        .format('DD-MMM-YYYY')
                        ?.toUpperCase()}
                    </>
                  )}
                </span>
                &nbsp;&nbsp;
                {eventItem?.subEventDetails?.totalSubEventCount &&
                eventItem?.subEventDetails?.totalSubEventCount != 0 ? (
                  <EventNumber label={eventItem?.subEventDetails?.totalSubEventCount} />
                ) : (
                  <></>
                )}
                {(eventItem?.eventStatus === eventStatus.EventPostponed ||
                  eventItem?.eventStatus === eventStatus.EventCancelled) && (
                  <EventStatus label={eventItem?.eventStatus} />
                )}
              </div>
            }
            description={
              <div className="event-list-description">
                <div className="event-list-description-name-container">
                  {!screens.md && eventItem?.isFeatured && (
                    <span>
                      <StarFilled style={{ color: '#1B3DE6' }} />
                    </span>
                  )}
                  <span className="event-list-description-name" data-cy="span-event-name">
                    {contentLanguageBilingual({
                      en: eventItem?.name?.en,
                      fr: eventItem?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </span>
                </div>
                <span className="event-list-description-place" data-cy="span-event-location">
                  {eventItem?.location
                    ?.map((place) => {
                      return contentLanguageBilingual({
                        en: place?.name?.en,
                        fr: place?.name?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      });
                    })
                    .join(' | ')}
                </span>
              </div>
            }
          />
          <List.Item.Meta
            className="event-status-list-item"
            onClick={() => listItemHandler(eventItem?.id, eventItem?.creator?.userId, eventItem?.publishState)}
            title={
              <div className="event-status-list-item-title-container">
                <EventStatus label={eventItem?.publishState} />
                {artsDataLinkChecker(eventItem)?.length > 0 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`${artsDataLinkChecker(eventItem)[0]?.uri}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="artsdata-link-outlined-icon"
                    data-cy="artsdata-link-outlined-icon">
                    <span>
                      <LinkOutlined style={{ fontSize: '14px' }} />
                    </span>
                  </div>
                )}
              </div>
            }
            description={
              <div className="event-list-status" data-cy="span-event-creator">
                <span className="event-list-status-created-by">
                  {t('dashboard.events.list.createdBy')}&nbsp;
                  {moment
                    .tz(eventItem?.creator?.date, eventItem?.scheduleTimezone ?? 'Canada/Eastern')
                    .locale(lang)
                    .format('DD-MMM-YYYY')
                    ?.toUpperCase()}
                  &nbsp;
                  {t('dashboard.events.list.by')}&nbsp;
                  <Username userName={eventItem?.creator?.userName} data-cy="span-event-creator-username" />
                </span>
                {eventItem?.modifier?.userName ? (
                  <span className="event-list-status-updated-by" data-cy="span-event-modifier">
                    {t('dashboard.events.list.updatedBy')}&nbsp;
                    {moment
                      .tz(eventItem?.modifier?.date, eventItem?.scheduleTimezone ?? 'Canada/Eastern')
                      .locale(lang)
                      .format('DD-MMM-YYYY')
                      ?.toUpperCase()}
                    &nbsp;
                    {t('dashboard.events.list.by')}&nbsp;
                    <Username userName={eventItem?.modifier?.userName} data-cy="span-event-modifier-username" />
                  </span>
                ) : (
                  <></>
                )}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default Lists;
