import React, { useState, useEffect } from 'react';
import './sidebar.css';
import { Layout, Menu } from 'antd';
import { sidebarItems } from '../../../constants/sidebarItems';
import { useTranslation } from 'react-i18next';
import CalendarList from '../../Dropdown/Calendar';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

const { Sider } = Layout;

function Sidebar(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentCalendarData, allCalendarsData } = props;
  const { user } = useSelector(getUserDetails);
  let { calendarId } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [calendarItem, setCalendarItem] = useState([]);

  const items = sidebarItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      icon: item.icon,
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
    const calendarLabel = bilingual({
      en: currentCalendarData?.name?.en,
      fr: currentCalendarData?.name?.fr,
      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
    });
    setCalendarItem(selectedCalendar(currentCalendarData?.id, currentCalendarData?.image?.uri, calendarLabel));
  }, [currentCalendarData]);

  const onSidebarClickHandler = ({ item }) => {
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
      <div className="sidebar-main-menu">
        <Menu
          defaultSelectedKeys={['1']}
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
