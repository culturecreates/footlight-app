import React, { useState } from 'react';
import './sidebar.css';
import { Layout, Menu } from 'antd';
import { sidebarItems } from '../../../constants/sidebarItems';
import { useTranslation } from 'react-i18next';
import CalendarList from '../../Dropdown/Calendar';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';

const { Sider } = Layout;

function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  let { calendarId } = useParams();

  const [collapsed, setCollapsed] = useState(false);

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
      <Menu
        defaultSelectedKeys={['1']}
        style={{
          height: 'auto',
          borderRight: 0,
        }}
        items={items}
        onClick={onSidebarClickHandler}
      />
    </Sider>
  );
}

export default Sidebar;
