import React, { useState, useEffect } from 'react';
import './dashboardNavigationBar.css';
import { Drawer, List, Avatar, Menu, Button } from 'antd';
import { useSelector } from 'react-redux';
import UserProfileDropdown from '../../Dropdown/UserProfile';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { userNameItems } from '../../../constants/userNameItems';
import { useTranslation } from 'react-i18next';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { sidebarItems } from '../../../constants/sidebarItems';
import CalendarList from '../../Dropdown/Calendar';
import { PathName } from '../../../constants/pathName';
import { useNavigate, useParams } from 'react-router-dom';

function NavigationBar(props) {
  const { t } = useTranslation();
  let { calendarId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const { currentCalendarData, allCalendarsData } = props;

  const [open, setOpen] = useState(false);
  const [calendarItem, setCalendarItem] = useState([]);

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
  const selectedCalendar = (id, uri, label = '') => {
    return [
      {
        key: id,
        icon: (
          <img
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '73px',
            }}
            src={uri}
          />
        ),
        label,
        className: 'sidebar-calendar',
      },
    ];
  };
  useEffect(() => {
    setCalendarItem(
      selectedCalendar(currentCalendarData?.id, currentCalendarData?.image?.uri, currentCalendarData?.name?.en),
    );
  }, [currentCalendarData]);
  const onSidebarClickHandler = ({ item }) => {
    navigate(`${PathName.Dashboard}/${calendarId}${item.props.path}`);
  };
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
      <UserProfileDropdown className="navigation-user-profile-dropdown" />
      <MenuOutlined onClick={showDrawer} className="navigation-responsive-sidebar-menu" />
      <Drawer
        className="sidebar-navigation-menu-responsive-drawer"
        title={
          <CalendarList allCalendarsData={allCalendarsData}>
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
        extra={
          <Button
            onClick={onClose}
            type="text"
            icon={<CloseOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />}
          />
        }
        placement="right"
        closable={false}
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
                      {user?.firstName?.charAt(0)}
                      {user?.lastName}
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
          onClick={onSidebarClickHandler}
        />
      </Drawer>
    </div>
  );
}

export default NavigationBar;
