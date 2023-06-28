import React from 'react';
import './listItem.css';
import { useTranslation } from 'react-i18next';
import { List } from 'antd';
import moment from 'moment-timezone';
import i18n from 'i18next';
import Username from '../../Username/Username';
import EventStatus from '../../Tags/Events/EventStatus';

function ListItem(props) {
  const {
    id,
    title,
    description,
    logo,
    artsDataLink,
    createdDate,
    createdByFirstName,
    createdByLastName,
    updatedDate,
    updatedByFirstName,
    updatedByLastName,
    scheduleTimezone,
    listItemHandler,
  } = props;
  const { t } = useTranslation();
  const dateFormat = 'DD-MMM-YYYY';
  const lang = i18n.language;

  return (
    <List.Item className="event-list-item-wrapper" key={id}>
      <List.Item.Meta
        className="event-list-item-meta"
        onClick={listItemHandler}
        avatar={
          <div className="event-list-image-wrapper">
            <img src={logo} className="event-list-image" />
          </div>
        }
        description={
          <div className="event-list-description">
            <span className="event-list-description-name">{title}</span>
            <span className="event-list-description-place">{description}</span>
          </div>
        }
      />
      <List.Item.Meta
        className="event-status-list-item"
        onClick={listItemHandler}
        title={<EventStatus label={artsDataLink} />}
        description={
          <div className="event-list-status">
            <span className="event-list-status-created-by">
              {t('dashboard.events.list.createdBy')}&nbsp;
              {moment
                .tz(createdDate, scheduleTimezone ?? 'Canada/Eastern')
                .locale(lang)
                .format(dateFormat)
                ?.toUpperCase()}
              &nbsp;
              {t('dashboard.events.list.by')}&nbsp;
              <Username firstName={createdByFirstName} lastName={createdByLastName} />
            </span>
            {updatedByFirstName && updatedByLastName ? (
              <span className="event-list-status-updated-by">
                {t('dashboard.events.list.updatedBy')}&nbsp;
                {moment
                  .tz(updatedDate, scheduleTimezone ?? 'Canada/Eastern')
                  .locale(lang)
                  .format(dateFormat)
                  ?.toUpperCase()}
                &nbsp;
                {t('dashboard.events.list.by')}&nbsp;
                <Username firstName={updatedByFirstName} lastName={updatedByLastName} />
              </span>
            ) : (
              <></>
            )}
          </div>
        }
      />
    </List.Item>
  );
}

export default ListItem;
