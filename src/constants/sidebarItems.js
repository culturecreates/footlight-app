import Icon, { CalendarOutlined, SettingOutlined, DatabaseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ReactComponent as Organizations } from '../assets/icons/organisations.svg';

const iconStyle = {
  fontSize: '18px',
  color: '#1B3DE6',
};
export const sidebarItems = [
  {
    name: 'dashboard.sidebar.events',
    path: '/events',
    component: <div>events</div>,
    icon: <CalendarOutlined style={iconStyle} />,
    disabled: false,
  },
  {
    name: 'dashboard.sidebar.places',
    path: '/places',
    component: <div>places</div>,
    icon: <EnvironmentOutlined style={iconStyle} />,
    disabled: true,
  },
  {
    name: 'dashboard.sidebar.organizations',
    path: '/organizations',
    component: <div>organizations</div>,
    icon: <Icon component={Organizations} style={iconStyle} />,
    disabled: true,
  },
  {
    name: 'dashboard.sidebar.taxonomies',
    path: '/taxonomies',
    component: <div>hai</div>,
    icon: <DatabaseOutlined style={iconStyle} />,
    disabled: true,
  },
  {
    name: 'dashboard.sidebar.settings',
    path: '/settings',
    component: <div>hai</div>,
    icon: <SettingOutlined style={iconStyle} />,
    disabled: true,
  },
];
