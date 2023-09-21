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
    defaultLogo,
    artsDataLink,
    createdDate,
    createdByUserName,
    updatedDate,
    updatedByUserName,
    scheduleTimezone,
    listItemHandler,
    actions,
  } = props;
  const { t } = useTranslation();
  const dateFormat = 'DD-MMM-YYYY';
  const lang = i18n.language;
  return (
    <List.Item className="event-list-item-wrapper" key={id} actions={actions} style={{ padding: '20px 0px' }}>
      <List.Item.Meta
        className="event-list-item-meta"
        onClick={listItemHandler}
        avatar={
          logo ? (
            <div className="event-list-image-wrapper" style={{ height: '40px', width: '40px' }}>
              <img src={logo} className="event-list-image" />
            </div>
          ) : (
            <div
              className="event-list-image-wrapper"
              style={{
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                backgroundColor: '#E3E8FF',
              }}>
              {defaultLogo}
            </div>
          )
        }
        description={
          <div className="event-list-description">
            <span className="event-list-description-name">{title}</span>
            <span className="event-list-description-place" style={{ width: '100%' }}>
              {description}
            </span>
          </div>
        }
      />
      <List.Item.Meta
        className="event-status-list-item"
        title={
          artsDataLink && (
            <ArtsDataLink onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}>
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
              <Username userName={createdByUserName} />
            </span>
            {updatedByUserName ? (
              <span className="event-list-status-updated-by">
                {t('dashboard.events.list.updatedBy')}&nbsp;
                {moment
                  .tz(updatedDate, scheduleTimezone ?? 'Canada/Eastern')
                  .locale(lang)
                  .format(dateFormat)
                  ?.toUpperCase()}
                &nbsp;
                {t('dashboard.events.list.by')}&nbsp;
                <Username userName={updatedByUserName} />
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
