import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import Tags from '../Common/Tags';

const StatusTag = ({ activityStatus }) => {
  const [activityStatusStyle, setActivityStatusStyle] = useState();
  const [activityStatusTextColor, setActivityStatusTextColor] = useState();
  const [activityStatusText, setActivityStatusText] = useState();

  const { t } = useTranslation();

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
      case userActivityStatus[3].key:
      case userActivityStatus[4].key:
        setActivityStatusStyle({ color: '#0F0E98' });
        setActivityStatusTextColor('#EFF2FF');
        setActivityStatusText(t('dashboard.settings.userManagement.inActiveStatus'));
        break;
      case userActivityStatus[2].key:
        setActivityStatusStyle({ color: '#B59800' });
        setActivityStatusTextColor('#FFF7CC');
        setActivityStatusText(t('dashboard.settings.userManagement.pending'));
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
