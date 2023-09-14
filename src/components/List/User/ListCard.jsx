import { List } from 'antd';
import React, { useEffect, useState } from 'react';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import Tags from '../../Tags/Common/Tags';
import './listCard.css';

const ListCard = (props) => {
  const { id, actions, listItemHandler, title, description, activityStatus, invitedBy } = props;

  const [activityStatusStyle, setActivityStatusStyle] = useState();
  const [activityStatusTextColor, setActivityStatusTextColor] = useState();
  const [activityStatusText, setActivityStatusText] = useState();

  useEffect(() => {
    handleStatusTagStyles();
  }, [activityStatus]);

  const handleStatusTagStyles = () => {
    switch (activityStatus) {
      case userActivityStatus[0].key:
        setActivityStatusStyle({ color: '#1D8221' });
        setActivityStatusTextColor('#DEF3D6');
        setActivityStatusText(userActivityStatus[0].label);
        break;
      case userActivityStatus[1].key:
        setActivityStatusStyle({ color: '#222732' });
        setActivityStatusTextColor(' #E8E8E8');
        setActivityStatusText(userActivityStatus[1].label);
        break;
      case userActivityStatus[2].key:
        setActivityStatusStyle({ color: '#B59800 ' });
        setActivityStatusTextColor('#FFF7CC');
        setActivityStatusText(userActivityStatus[2].label);
        break;
      default:
        break;
    }
  };

  return (
    <List.Item
      className="users-list-item-wrapper"
      key={id}
      actions={actions}
      style={{ padding: '24px 0px' }}
      onClick={listItemHandler}>
      <List.Item.Meta className="user-item-meta" title={title} description={description} />
      <div className="user-item-content">
        <Tags color={activityStatusTextColor} style={activityStatusStyle}>
          {activityStatusText}
        </Tags>
        <div className="invitation-details">
          <span className="invitation-details-text-prolouge">{`Invited By `}</span>
          <span className="invitation-details-username">{invitedBy}</span>
        </div>
      </div>
    </List.Item>
  );
};

export default ListCard;
