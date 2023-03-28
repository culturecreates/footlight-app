import { SettingOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';

const iconStyle = {
  color: '#646D7B',
};

export const userNameItems = [
  {
    label: <Translation>{(t) => t('dashboard.topNavigation.userProfile')}</Translation>,
    icon: <SettingOutlined style={iconStyle} />,
    key: 'userProfile',
  },
  {
    label: <Translation>{(t) => t('dashboard.topNavigation.help')}</Translation>,
    key: 'help',
    icon: <QuestionCircleOutlined style={iconStyle} />,
  },
  {
    label: <Translation>{(t) => t('dashboard.topNavigation.logOut')}</Translation>,
    key: 'logOut',
    icon: <LogoutOutlined style={iconStyle} />,
  },
];
