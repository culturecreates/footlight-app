import React, { useState } from 'react';
import './dashboardNavigationBar.css';
import { Drawer, List, Avatar, Menu } from 'antd';
import { useSelector } from 'react-redux';
import Dropdown from '../../Dropdown/UserProfile';
import { MenuOutlined } from '@ant-design/icons';
import { userNameItems } from '../../../constants/userNameItems';
import { useTranslation } from 'react-i18next';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { sidebarItems } from '../../../constants/sidebarItems';
import CalendarList from '../../Dropdown/Calendar';

function NavigationBar() {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const { user } = useSelector(getUserDetails);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const items = userNameItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      label: t(item.label),
      icon: item.icon,
    };
  });
  const itemsOptions = sidebarItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      label: t(item.name),
      className: 'sidebar-menu-item',
      path: item.path,
    };
  });
  const calendarItem = [
    {
      key: '0',
      icon: (
        <img
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '73px',
          }}
          src={require('../../../assets/images/logo-tout-culture.png')}
        />
      ),
      label: 'calendar',
      className: 'sidebar-calendar',
    },
  ];

  return (
    <div className="navigation-bar-wrapper">
      <div className="logo-wrapper">
        <img
          src={require('../../../assets/images/footlight-logo-small.png')}
          alt="Footlight logo"
          className="footlight-logo"
        />
        <h6 className="logo-name">Footlight</h6>
      </div>
      <Dropdown className="navigation-user-profile-dropdown" />
      <MenuOutlined onClick={showDrawer} className="navigation-responsive-sidebar-menu" />
      <Drawer
        title={
          <CalendarList>
            <Menu
              defaultSelectedKeys={['1']}
              style={{
                height: 'auto',
                borderRight: 0,
              }}
              items={calendarItem}
            />
          </CalendarList>
        }
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        key="right"
        width={294}
        footer={
          <>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar className="dropdown-avatar" src={user.profileImage} size={32} />}
                  title={
                    <span>
                      {user.firstName}
                      {user.lastName}
                    </span>
                  }
                />
              </List.Item>
            </List>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta avatar={item.icon} title={<span>{item.label}</span>} />
                </List.Item>
              )}
            />
          </>
        }>
        <Menu
          defaultSelectedKeys={['1']}
          style={{
            height: 'auto',
            borderRight: 0,
          }}
          items={itemsOptions}
        />
      </Drawer>
    </div>
  );
}

export default NavigationBar;
