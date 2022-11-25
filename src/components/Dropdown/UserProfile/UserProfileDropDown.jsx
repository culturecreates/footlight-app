import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import React from 'react';
import './UserProfileDropDown.css';
import { useSelector } from 'react-redux';
import { clearUser, getUserDetails } from '../../../redux/reducer/userSlice';
import { userNameItems } from '../../../constants/userNameItems';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { useDispatch } from 'react-redux';

const UserProfileDropDown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);

  const { t } = useTranslation();
  const items = userNameItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      label: t(item.label),
      icon: item.icon,
    };
  });

  const onClick = ({ key }) => {
    if (key == 2) {
      dispatch(clearUser());
      navigate(PathName.Login);
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
          {user.firstName}
          {user.lastName}
        </span>
        <CaretDownOutlined />
      </div>
    </Dropdown>
  );
};
export default UserProfileDropDown;
