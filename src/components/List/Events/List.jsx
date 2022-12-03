import React from 'react';
import './list.css';
import { List, Grid } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';
import EventStatusOptions from '../../Dropdown/EventStatus/EventStatus';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

const { useBreakpoint } = Grid;

function Lists(props) {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const { data, pageNumber, setPageNumber } = props;

  const { user } = useSelector(getUserDetails);

  const totalCount = data?.totalCount;
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
        current: pageNumber,
      }}
      renderItem={(eventItem, index) => (
        <List.Item
          className="event-list-item-wrapper"
          actions={[
            <EventStatusOptions key={index}>
              <span>
                <MoreOutlined className="event-list-more-icon" key={index} />
              </span>
            </EventStatusOptions>,
          ]}
          extra={[
            <span key={index} className="event-list-options-responsive">
              <EventStatusOptions key={index}>
                <span>
                  <MoreOutlined className="event-list-more-icon-responsive" key={index} />
                </span>
              </EventStatusOptions>
            </span>,
          ]}>
          <List.Item.Meta
            avatar={<img src={eventItem?.image?.original?.uri} className="event-list-image" />}
            title={
              <div className="event-list-title">
                <span className="event-list-title-heading">
                  {moment(eventItem?.startDate).format('DD-MMM-YYYY')?.toUpperCase()}
                  {eventItem?.endDate ? (
                    <>
                      &nbsp;{t('dashboard.events.list.to')}&nbsp;
                      {moment(eventItem?.endDate).format('DD-MMM-YYYY')?.toUpperCase()}
                    </>
                  ) : (
                    <></>
                  )}
                </span>
                &nbsp;&nbsp;
                {eventItem?.subEventDetails?.upcomingSubEventCount &&
                eventItem?.subEventDetails?.upcomingSubEventCount != 0 ? (
                  <EventNumber label={eventItem?.subEventDetails?.upcomingSubEventCount} />
                ) : (
                  <></>
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
                    return bilingual({
                      en: place?.name?.en,
                      fr: place?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    });
                  })}
                </span>
              </div>
            }
          />
          <List.Item.Meta
            className="event-status-list-item"
            title={<EventStatus label={eventItem?.publishState} />}
            description={
              <div className="event-list-status">
                <span className="event-list-status-created-by">
                  {t('dashboard.events.list.createdBy')}&nbsp;
                  <span className="event-list-status-userdetail">
                    {eventItem?.creator?.firstName?.charAt(0)}
                    {eventItem?.creator?.lastName}
                  </span>
                </span>
                {eventItem?.modifier?.firstName ? (
                  <span className="event-list-status-updated-by">
                    {t('dashboard.events.list.updatedBy')}&nbsp;
                    {moment(eventItem?.modifier?.date).format('DD-MMM-YYYY')?.toUpperCase()}&nbsp;
                    {t('dashboard.events.list.by')}&nbsp;
                    <span className="event-list-status-userdetail">
                      {eventItem?.modifier?.firstName?.charAt(0)}
                      {eventItem?.creator?.lastName}
                    </span>
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
