import React from 'react';
import './list.css';
import { List } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EventStatus from '../../Tags/Events';
import EventNumber from '../../Tags/EventNumber';
import EventStatusOptions from '../../Dropdown/EventStatus/EventStatus';
import { useSelector } from 'react-redux';
import { getinterfaceLanguage } from '../../../redux/reducer/interfaceLanguageSlice';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

function Lists(props) {
  const { t } = useTranslation();

  const interfaceLanguage = useSelector(getinterfaceLanguage);

  const { data } = props;

  return (
    <List
      className="event-list-wrapper"
      itemLayout="horizontal"
      dataSource={data.data}
      bordered={false}
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 10,
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
                <EventNumber label="24" />
              </div>
            }
            description={
              <div className="event-list-description">
                <span className="event-list-description-name">
                  {interfaceLanguage == 'en' ? eventItem?.name?.en : eventItem?.name?.fr}
                </span>
                <span className="event-list-description-place">
                  {eventItem?.location?.map((place) => {
                    return place?.name?.en;
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
                <span>
                  {t('dashboard.events.list.createdBy')}&nbsp;
                  <span className="event-list-status-userdetail">{eventItem?.creator?.userName}</span>
                </span>
                <span>
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
