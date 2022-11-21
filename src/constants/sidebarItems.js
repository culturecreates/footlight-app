import { CalendarOutlined, SettingOutlined, DatabaseOutlined, EnvironmentOutlined } from '@ant-design/icons';
export const sidebarItems = [
  {
    name: 'Events',
    path: '/events',
    component: <div>events</div>,
    icon: <CalendarOutlined />,
  },
  {
    name: 'Places',
    path: '/places',
    component: <div>places</div>,
    icon: <EnvironmentOutlined />,
  },
  {
    name: 'Organizations',
    path: '/organizations',
    component: <div>organizations</div>,
    icon: <img src={require('../assets/icons/organizations.png')} />,
  },
  {
    name: 'Taxonomies',
    path: '/taxonomies',
    component: <div>hai</div>,
    icon: <DatabaseOutlined />,
  },
  {
    name: 'Settings',
    path: '/settings',
    component: <div>hai</div>,
    icon: <SettingOutlined />,
  },
];
