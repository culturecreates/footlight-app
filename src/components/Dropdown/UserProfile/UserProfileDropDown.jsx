import { UserOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import React from 'react';
import './UserProfileDropDown.css';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { userNameItems } from '../../../constants/userNameItems';
import { useTranslation } from 'react-i18next';

const UserProfileDropDown = () => {
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
  return (
    <Dropdown
      className="user-profile-dropdown"
      placement="bottom"
      menu={{
        items,
      }}
      trigger={['click']}>
      <div className="user-profile-dropwdown-content">
        <Avatar className="dropdown-avatar" icon={<UserOutlined />} size={32} />
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
