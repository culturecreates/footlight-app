import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import React from 'react';
import './UserProfileDropDown.css';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { userNameItems } from '../../../constants/userNameItems';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import i18n from 'i18next';

const UserProfileDropDown = () => {
  const navigate = useNavigate();
  let { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);

  const items = userNameItems.map((item) => {
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
    };
  });

  const onClick = ({ key }) => {
    switch (key) {
      case 'userProfile':
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Profile}/${user?.id}`);
        break;
      case 'help':
        if (i18n.language === 'en')
          window.open('https://footlight.gitbook.io/footlight-cms-guide', '_blank', 'noopener,noreferrer');
        else if (i18n.language === 'fr')
          window.open('https://footlight.gitbook.io/guide-footlight-cms', '_blank', 'noopener,noreferrer');
        break;
      case 'logOut':
        navigate(PathName.Login, { state: { previousPath: 'logout' } });
        break;
      default:
        break;
    }
  };
  return (
    <Dropdown
      className="user-profile-dropdown"
      placement="bottom"
      menu={{
        items,
        onClick,
      }}
      trigger={['click']}>
      <div className="user-profile-dropwdown-content">
        <Avatar className="dropdown-avatar" src={user.profileImage} size={32} />
        <span className="user-profile-user-name">
          {user?.firstName?.charAt(0)}
          {user?.lastName}
        </span>
        <CaretDownOutlined />
      </div>
    </Dropdown>
  );
};
export default UserProfileDropDown;
