import { UserOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import React from 'react';
import './UserProfileDropDown.css';
import { userNameItems } from '../../constants/userNameItems';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';

const UserProfileDropDown = () => {
  const { user } = useSelector(getUserDetails);

  return (
    <Dropdown
      className="user-profile-dropdown"
      menu={{
        userNameItems,
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
