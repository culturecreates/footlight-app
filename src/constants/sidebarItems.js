import Icon, {
  CalendarOutlined,
  SettingOutlined,
  TagOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { ReactComponent as Organizations } from '../assets/icons/organisations.svg';
import { featureFlags } from '../utils/featureFlags';

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
    adminOnly: false,
  },
  {
    name: 'dashboard.sidebar.places',
    path: '/places',
    component: <div>places</div>,
    icon: <EnvironmentOutlined style={iconStyle} />,
    disabled: false,
    adminOnly: false,
  },
  {
    name: 'dashboard.sidebar.organizations',
    path: '/organizations',
    component: <div>organizations</div>,
    icon: <Icon component={Organizations} style={iconStyle} />,
    disabled: featureFlags.orgPersonPlacesView === 'true' ? false : true,
    adminOnly: false,
  },
  {
    name: 'dashboard.sidebar.people',
    path: '/people',
    component: <div>people</div>,
    icon: <TeamOutlined style={iconStyle} />,
    disabled: featureFlags.orgPersonPlacesView === 'true' ? false : true,
    adminOnly: false,
  },
  {
    name: 'dashboard.sidebar.taxonomies',
    path: '/taxonomies',
    component: <div>taxonomies</div>,
    icon: <TagOutlined style={iconStyle} />,
    disabled: featureFlags.taxonomy === 'true' ? false : true,
    adminOnly: true,
  },
  {
    name: 'dashboard.sidebar.settings',
    path: '/settings',
    component: <div>settings</div>,
    icon: <SettingOutlined style={iconStyle} />,
    disabled: featureFlags.settingsScreenUsers === 'true' ? false : true,
    adminOnly: false,
  },
];
