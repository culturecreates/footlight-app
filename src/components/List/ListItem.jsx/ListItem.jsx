import React from 'react';
import './listItem.css';
import { useTranslation } from 'react-i18next';
import { List } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import i18n from 'i18next';
import Username from '../../Username/Username';

import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';

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
    actions,
  } = props;
  const { t } = useTranslation();
  const dateFormat = 'DD-MMM-YYYY';
  const lang = i18n.language;
  return (
    <List.Item className="event-list-item-wrapper" key={id} actions={actions}>
      <List.Item.Meta
        className="event-list-item-meta"
        onClick={listItemHandler}
        avatar={
          <div className="event-list-image-wrapper" style={{ height: '40px', width: '40px' }}>
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
        title={
          artsDataLink && (
            <ArtsDataLink onClick={() => console.log('tag click')}>
              <span style={{ textDecoration: 'underline' }}>Artsdata</span>
              <LinkOutlined />
            </ArtsDataLink>
          )
        }
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
