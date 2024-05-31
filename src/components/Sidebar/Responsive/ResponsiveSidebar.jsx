import React, { useState, useEffect } from 'react';
import './responsiveSidebar.css';
import { Drawer, List, Avatar, Menu, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import './index';
import { userNameItems } from '../../../constants/userNameItems';
import { sidebarItems } from '../../../constants/sidebarItems';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, getUserDetails } from '../../../redux/reducer/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { useTranslation } from 'react-i18next';
import CalendarList from '../../Dropdown/Calendar';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import i18n from 'i18next';
import { calendarModes } from '../../../constants/calendarModes';
import { userRoles } from '../../../constants/userRoles';
import { handleLogout } from '../../../hooks/useAuth';

function ResponsiveSidebar(props) {
  const { allCalendarsData, currentCalendarData, onClose, open, pageNumber, setPageNumber } = props;
  const { t } = useTranslation();
  let { calendarId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);

  const [calendarItem, setCalendarItem] = useState([]);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const items = userNameItems.map((item) => {
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
    };
  });
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const itemsOptions = sidebarItems.map((item, index) => {
    const key = String(index + 1);
    const itemJson = {
      key: key,
      icon: item.icon,
      label: t(item.name),
      className: 'sidebar-menu-item',
      path: item.path,
      disabled: item.disabled,
    };
    if (item.adminOnly) {
      if (adminCheckHandler()) return itemJson;
    } else return itemJson;
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
        label: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
            <span style={{ height: currentCalendarData?.mode === calendarModes.READ_ONLY && '16px' }}>
              {label}
              <DownOutlined
                style={{
                  position: 'relative',
                  left: '70%',
                  top: '50%',
                  fontSize: '8px',
                }}
              />
            </span>

            {currentCalendarData?.mode === calendarModes.READ_ONLY && (
              <span style={{ fontSize: '12px', fontWeight: 400 }}>
                {t('dashboard.calendar.readOnlyMode.readOnlyMode')}
              </span>
            )}
          </div>
        ),
        className: 'sidebar-calendar',
      },
    ];
  };

  const onSidebarClickHandler = ({ item }) => {
    onClose();
    navigate(`${PathName.Dashboard}/${calendarId}${item.props.path}`);
  };
  const logoutHandler = ({ key }) => {
    switch (key) {
      case 'userProfile':
        onClose();
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Profile}/${user?.id}`);
        break;
      case 'help':
        if (i18n.language === 'en') window.open('https://footlight.gitbook.io/footlight-cms-guide', '_blank');
        else if (i18n.language === 'fr') window.open('https://footlight.gitbook.io/guide-footlight-cms', '_blank');
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
  useEffect(() => {
    const calendarLabel = contentLanguageBilingual({
      en: currentCalendarData?.name?.en,
      fr: currentCalendarData?.name?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      calendarContentLanguage: calendarContentLanguage,
    });
    setCalendarItem(selectedCalendar(currentCalendarData?.id, currentCalendarData?.logo?.original?.uri, calendarLabel));
  }, [currentCalendarData, user?.interfaceLanguage]);
  return (
    <Drawer
      className="sidebar-navigation-menu-responsive-drawer"
      title={
        <div className="sidebar-calendar-menu-responsive">
          <CalendarList pageNumber={pageNumber} setPageNumber={setPageNumber} allCalendarsData={allCalendarsData}>
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
                className="user-details-responsive"
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
              <List.Item className="sidebar-footer-item" onClick={() => logoutHandler(item)}>
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
