import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './list.css';
import { List, Grid } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';
import EventStatusOptions from '../../Dropdown/EventStatus/EventStatus';
import { useTranslation } from 'react-i18next';
import FormatDate from '../../Date/FormatDate';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import i18n from 'i18next';
import { PathName } from '../../../constants/pathName';
import Username from '../../Username/index';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { dateTimeTypeHandler } from '../../../utils/dateTimeTypeHandler';
import { dateTypes } from '../../../constants/dateTypes';
import { eventStatus } from '../../../constants/eventStatus';

const { useBreakpoint } = Grid;

function Lists(props) {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, pageNumber, setPageNumber } = props;
  let { calendarId } = useParams();
  const lang = i18n.language;
  const { user } = useSelector(getUserDetails);
  const totalCount = data?.totalCount;

  const listItemHandler = (id, creatorId, publishState) => {
    if (routinghandler(user, calendarId, creatorId, publishState))
      navigate(`${location.pathname}${PathName.AddEvent}/${id}`);
    else navigate(`${location.pathname}/${id}`);
  };
  return (
    <List
      className="event-list-wrapper"
      itemLayout={screens.xs ? 'vertical' : 'horizontal'}
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
      }}
      renderItem={(eventItem, index) => (
        <List.Item
          className="event-list-item-wrapper"
          actions={[
            <EventStatusOptions
              key={index}
              publishState={eventItem?.publishState}
              creator={eventItem?.creator}
              eventId={eventItem?.id}>
              <span>
                <MoreOutlined className="event-list-more-icon" key={index} />
              </span>
            </EventStatusOptions>,
          ]}
          extra={[
            <span key={index} className="event-list-options-responsive">
              <EventStatusOptions
                key={index}
                publishState={eventItem?.publishState}
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
            avatar={<img src={eventItem?.image?.original} className="event-list-image" />}
            title={
              <div className="event-list-title">
                <span className="event-list-title-heading">
                  {(eventItem?.startDate || eventItem?.startDateTime) && (
                    <FormatDate date={eventItem?.startDate ?? eventItem?.startDateTime} lang={lang} />
                  )}
                  {dateTimeTypeHandler(
                    eventItem?.startDate,
                    eventItem?.startDateTime,
                    eventItem?.endDate,
                    eventItem?.endDateTime,
                  ) === dateTypes.RANGE && (
                    <>
                      &nbsp;{t('dashboard.events.list.to')}&nbsp;
                      <FormatDate date={eventItem?.endDate ?? eventItem?.endDateTime} lang={lang} />
                    </>
                  )}
                </span>
                &nbsp;&nbsp;
                {eventItem?.subEventDetails?.upcomingSubEventCount &&
                eventItem?.subEventDetails?.upcomingSubEventCount != 0 ? (
                  <EventNumber label={eventItem?.subEventDetails?.upcomingSubEventCount} />
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
                <span className="event-list-description-name">
                  {bilingual({
                    en: eventItem?.name?.en,
                    fr: eventItem?.name?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  })}
                </span>
                <span className="event-list-description-place">
                  {eventItem?.location?.map((place) => {
                    if (!place?.isVirtualLocation)
                      return bilingual({
                        en: place?.name?.en,
                        fr: place?.name?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      });
                    else if (place?.isVirtualLocation)
                      return (
                        <>
                          {eventItem?.location?.length > 1 && <>&nbsp;|&nbsp;</>}
                          {bilingual({
                            en: place?.name?.en,
                            fr: place?.name?.fr,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          })}
                        </>
                      );
                  })}
                </span>
              </div>
            }
          />
          <List.Item.Meta
            className="event-status-list-item"
            onClick={() => listItemHandler(eventItem?.id, eventItem?.creator?.userId, eventItem?.publishState)}
            title={<EventStatus label={eventItem?.publishState} />}
            description={
              <div className="event-list-status">
                <span className="event-list-status-created-by">
                  {t('dashboard.events.list.createdBy')}&nbsp;
                  <Username firstName={eventItem?.creator?.firstName} lastName={eventItem?.creator?.lastName} />
                </span>
                {eventItem?.modifier?.firstName && eventItem?.modifier?.lastName ? (
                  <span className="event-list-status-updated-by">
                    {t('dashboard.events.list.updatedBy')}&nbsp;
                    <FormatDate date={eventItem?.modifier?.date} lang={lang} />
                    &nbsp;
                    {t('dashboard.events.list.by')}&nbsp;
                    <Username firstName={eventItem?.modifier?.firstName} lastName={eventItem?.modifier?.lastName} />
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
