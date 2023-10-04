import { List } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import StatusTag from '../../Tags/UserStatus/StatusTag';
import './listCard.css';

const ListCard = (props) => {
  const { id, actions, listItemHandler, title, description, activityStatus, invitedBy, styles } = props;
  const { t } = useTranslation();
  console.log(styles);
  return (
    <List.Item className="users-list-item-wrapper" key={id} actions={actions} {...styles}>
      <List.Item.Meta className="user-item-meta" title={title} description={description} onClick={listItemHandler} />
      <div className="user-item-content" onClick={listItemHandler}>
        <StatusTag activityStatus={activityStatus} />
        {invitedBy && (
          <div className="invitation-details">
            <span className="invitation-details-text-prologue">{t('dashboard.settings.userManagement.invitedBy')}</span>
            <span className="invitation-details-username">{invitedBy}</span>
          </div>
        )}
      </div>
    </List.Item>
  );
};

export default ListCard;
