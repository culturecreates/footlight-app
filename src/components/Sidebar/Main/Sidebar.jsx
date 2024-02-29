import React, { useState, useEffect } from 'react';
import './sidebar.css';
import { DownOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { sidebarItems } from '../../../constants/sidebarItems';
import { useTranslation } from 'react-i18next';
import CalendarList from '../../Dropdown/Calendar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { clearSessionStoredSearchQueries } from '../../../utils/clearSessionStoredSearchQueries';
import { calendarModes } from '../../../constants/calendarModes';
import { userRoles } from '../../../constants/userRoles';

const { Sider } = Layout;

function Sidebar(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCalendarData, allCalendarsData, pageNumber, setPageNumber } = props;
  const { user } = useSelector(getUserDetails);
  let { calendarId } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [calendarItem, setCalendarItem] = useState([]);
  const [selectedKey, setSelectedKey] = useState([]);
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const items = sidebarItems.map((item, index) => {
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
          <div className="calendar-icon-container">
            <img
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '73px',
                objectFit: 'contain',
              }}
              src={uri}
            />
          </div>
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
                  top: '50%',
                  left: '100%',
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

  useEffect(() => {
    items?.forEach((item) => {
      if (location.pathname?.includes(item?.path)) setSelectedKey([item?.key]);
    });
  }, [location]);

  useEffect(() => {
    const calendarLabel = contentLanguageBilingual({
      en: currentCalendarData?.name?.en,
      fr: currentCalendarData?.name?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
      calendarContentLanguage: calendarContentLanguage,
    });
    setCalendarItem(selectedCalendar(currentCalendarData?.id, currentCalendarData?.image?.uri, calendarLabel));
  }, [currentCalendarData]);

  const onSidebarClickHandler = ({ item, key }) => {
    if (key !== selectedKey) {
      clearSessionStoredSearchQueries();
    }
    setSelectedKey([key]);
    navigate(`${PathName.Dashboard}/${calendarId}${item.props.path}`);
  };
  return (
    <Sider
      width={256}
      className="sidebar-wrapper"
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      breakpoint={('sm', 'xs', 'lg')}>
      <div className="sidebar-calendar-menu">
        <CalendarList allCalendarsData={allCalendarsData} pageNumber={pageNumber} setPageNumber={setPageNumber}>
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
      <div className="sidebar-main-menu">
        <Menu
          selectedKeys={selectedKey}
          style={{
            height: 'auto',
            borderRight: 0,
          }}
          items={items}
          onClick={onSidebarClickHandler}
        />
      </div>
    </Sider>
  );
}

export default Sidebar;
