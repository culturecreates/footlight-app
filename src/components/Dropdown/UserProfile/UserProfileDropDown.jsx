import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import React from 'react';
import './UserProfileDropDown.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, getUserDetails } from '../../../redux/reducer/userSlice';
import { userNameItems } from '../../../constants/userNameItems';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import i18n from 'i18next';
import { featureFlags } from '../../../utils/featureFlags';
import { handleLogout } from '../../../hooks/useAuth';

const UserProfileDropDown = () => {
  const navigate = useNavigate();
  let { calendarId } = useParams();
  const dispatch = useDispatch();
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
        if (featureFlags.settingsScreenUsers === 'true')
          navigate(
            `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}?id=${user.id}`,
          );
        else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Profile}/${user?.id}`);
        break;
      case 'help':
        if (i18n.language === 'en')
          window.open(`${import.meta.env.VITE_APP_HELP_EN_URL}`, '_blank', 'noopener,noreferrer');
        else if (i18n.language === 'fr')
          window.open(`${import.meta.env.VITE_APP_HELP_FR_URL}`, '_blank', 'noopener,noreferrer');
        break;
      case 'logOut':
        sessionStorage.clear();
        handleLogout({ user, clearData: () => dispatch(clearUser()) });
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
        <span className="user-profile-user-name">{user?.userName}</span>
        <CaretDownOutlined />
      </div>
    </Dropdown>
  );
};
export default UserProfileDropDown;
