import React from 'react';
import './list.css';
import { List } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';
import EventStatusOptions from '../../Dropdown/EventStatus/EventStatus';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getinterfaceLanguage } from '../../../redux/reducer/interfaceLanguageSlice';

function Lists(props) {
  const { t } = useTranslation();
  const { data, pageNumber, setPageNumber } = props;

  const interfaceLanguage = useSelector(getinterfaceLanguage);

  const totalCount = data?.totalCount;
  return (
    <List
      className="event-list-wrapper"
      itemLayout="horizontal"
      dataSource={data?.data}
      bordered={false}
      pagination={{
        onChange: (page) => {
          console.log(page);
          setPageNumber(page);
        },
        pageSize: 10,
        total: totalCount,
        current: pageNumber,
      }}
      renderItem={(eventItem, index) => (
        <List.Item
          actions={[
            <EventStatusOptions key={index}>
              <span>
                <MoreOutlined className="event-list-more-icon" key={index} />
              </span>
            </EventStatusOptions>,
          ]}>
          <List.Item.Meta
            avatar={<img src={eventItem?.image?.original?.uri} className="event-list-image" />}
            title={
              <div className="event-list-title">
                <span className="event-list-title-heading">
                  {moment(eventItem?.startDate).format('DD-MM-YYYY')}&nbsp;{t('dashboard.events.list.to')}&nbsp;
                  {moment(eventItem?.endDate).format('DD-MM-YYYY')}
                </span>
                &nbsp;&nbsp;
                <EventNumber label={eventItem?.subEventDetails?.upcomingSubEventCount} />
              </div>
            }
            description={
              <div className="event-list-description">
                <span className="event-list-description-name">
                  {bilingual({
                    en: eventItem?.name?.en,
                    fr: eventItem?.name?.fr,
                    interfaceLanguage: interfaceLanguage,
                  })}
                </span>
                <span className="event-list-description-place">
                  {eventItem?.location?.map((place) => {
                    return bilingual({
                      en: place?.name?.en,
                      fr: place?.name?.fr,
                      interfaceLanguage: interfaceLanguage,
                    });
                  })}
                </span>
              </div>
            }
          />
          <List.Item.Meta
            style={{ textAlign: 'right' }}
            title={<EventStatus label={eventItem?.publishState} />}
            description={
              <div className="event-list-status">
                <span className="event-list-status-created-by">
                  {t('dashboard.events.list.createdBy')}&nbsp;
                  <span className="event-list-status-userdetail">{eventItem?.creator?.userName}</span>
                </span>
                <span className="event-list-status-updated-by">
                  {t('dashboard.events.list.updatedBy')}&nbsp;
                  {moment(eventItem?.modifier?.date).format('DD-MM-YYYY')} {t('dashboard.events.list.by')}&nbsp;
                  <span className="event-list-status-userdetail">{eventItem?.modifier?.userName}</span>
                </span>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default Lists;
