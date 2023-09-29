import React, { useEffect, useState } from 'react';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import Tags from '../Common/Tags';

const StatusTag = ({ activityStatus }) => {
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
    <div className="user-status-tag">
      <Tags color={activityStatusTextColor} style={activityStatusStyle}>
        {activityStatusText}
      </Tags>
    </div>
  );
};

export default StatusTag;
