import Icon, { CalendarOutlined, SettingOutlined, DatabaseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../assets/icons/organisations.svg';

const iconStyle = {
  height: '24px',
  width: '24px',
  color: '#1B3DE6',
};
export const sidebarItems = [
  {
    name: 'Events',
    path: '/events',
    component: <div>events</div>,
    icon: <CalendarOutlined style={iconStyle} />,
  },
  {
    name: 'Places',
    path: '/places',
    component: <div>places</div>,
    icon: <EnvironmentOutlined style={iconStyle} />,
  },
  {
    name: 'Organizations',
    path: '/organizations',
    component: <div>organizations</div>,
    icon: <Icon component={Organizations} style={iconStyle} />,
  },
  {
    name: 'Taxonomies',
    path: '/taxonomies',
    component: <div>hai</div>,
    icon: <DatabaseOutlined style={iconStyle} />,
  },
  {
    name: 'Settings',
    path: '/settings',
    component: <div>hai</div>,
    icon: <SettingOutlined style={iconStyle} />,
  },
];
