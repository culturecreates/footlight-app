import React, { useState, useEffect } from 'react';
import './responsiveSidebar.css';
import { Drawer, List, Avatar, Menu, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './index';
import { userNameItems } from '../../../constants/userNameItems';
import { sidebarItems } from '../../../constants/sidebarItems';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, clearUser } from '../../../redux/reducer/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { useTranslation } from 'react-i18next';
import CalendarList from '../../Dropdown/Calendar';
import { bilingual } from '../../../utils/bilingual';

function ResponsiveSidebar(props) {
  const { allCalendarsData, currentCalendarData, onClose, open } = props;
  const { t } = useTranslation();
  let { calendarId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);

  const [calendarItem, setCalendarItem] = useState([]);

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
      disabled: item.disabled,
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

  const onSidebarClickHandler = ({ item }) => {
    navigate(`${PathName.Dashboard}/${calendarId}${item.props.path}`);
  };
  const logoutHandler = ({ key }) => {
    if (key == 2) {
      dispatch(clearUser());
      navigate(PathName.Login);
    }
  };
  useEffect(() => {
    const calendarLabel = bilingual({
      en: currentCalendarData?.name?.en,
      fr: currentCalendarData?.name?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
    });
    setCalendarItem(selectedCalendar(currentCalendarData?.id, currentCalendarData?.image?.uri, calendarLabel));
  }, [currentCalendarData]);
  return (
    <Drawer
      className="sidebar-navigation-menu-responsive-drawer"
      title={
        <div className="sidebar-calendar-menu-responsive">
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
        </div>
      }
      extra={
        <Button onClick={onClose} type="text" icon={<CloseOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />} />
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
                  <span className="username-responsive">
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
              <List.Item onClick={() => logoutHandler(item)}>
                <List.Item.Meta avatar={item.icon} title={<span>{item.label}</span>} />
              </List.Item>
            )}
          />
        </>
      }>
      <div className="sidebar-main-menu-repsonsive">
        <Menu
          defaultSelectedKeys={['1']}
          style={{
            height: 'auto',
            borderRight: 0,
          }}
          items={itemsOptions}
          onClick={onSidebarClickHandler}
        />
      </div>
    </Drawer>
  );
}

export default ResponsiveSidebar;
