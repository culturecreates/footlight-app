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
    <List.Item
      data-cy="list-item-entity"
      className="event-list-item-wrapper"
      key={id}
      extra={actions}
      style={{ padding: '20px 0px', ...props?.styles?.style }}>
      <List.Item.Meta
        className="event-list-item-meta"
        onClick={listItemHandler}
        data-cy="list-item-meta-entity"
        avatar={
          logo ? (
            <div className="event-list-image-wrapper" style={{ height: '40px', width: '40px' }}>
              <img
                src={logo}
                className="event-list-image"
                style={{ height: '40px', width: '40px' }}
                data-cy="image-entity-logo"
              />
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
            <span className="event-list-description-name" data-cy="span-entity-title">
              {title}
            </span>
            <span className="event-list-description-place" style={{ width: '100%' }} data-cy="span-entity-description">
              {description}
            </span>
          </div>
        }
      />
      <List.Item.Meta
        className="event-status-list-item"
        title={
          artsDataLink && (
            <ArtsDataLink
              onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}
              data-cy="tag-entity-artsdata">
              <span style={{ textDecoration: 'underline' }} data-cy="span-entity-artsdata">
                Artsdata
              </span>
              <LinkOutlined />
            </ArtsDataLink>
          )
        }
        description={
          <div className="event-list-status">
            <span className="event-list-status-created-by" data-cy="span-entity-created-date">
              {t('dashboard.events.list.createdBy')}&nbsp;
              {moment
                .tz(createdDate, scheduleTimezone ?? 'Canada/Eastern')
                .locale(lang)
                .format(dateFormat)
                ?.toUpperCase()}
              &nbsp;
              {t('dashboard.events.list.by')}&nbsp;
              <Username userName={createdByUserName} data-cy="span-entity-created-username" />
            </span>
            {updatedByUserName ? (
              <span className="event-list-status-updated-by" data-cy="span-entity-updated-date">
                {t('dashboard.events.list.updatedBy')}&nbsp;
                {moment
                  .tz(updatedDate, scheduleTimezone ?? 'Canada/Eastern')
                  .locale(lang)
                  .format(dateFormat)
                  ?.toUpperCase()}
                &nbsp;
                {t('dashboard.events.list.by')}&nbsp;
                <Username userName={updatedByUserName} data-cy="span-entity-updated-username" />
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
