import { SettingOutlined, DeploymentUnitOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';

const iconStyle = {
  color: '#646D7B',
};

export const userNameItems = [
  {
    label: (
      <span data-cy="user-menu-item" data-action="user-profile">
        <Translation>{(t) => t('dashboard.topNavigation.userProfile')}</Translation>
      </span>
    ),
    icon: <SettingOutlined style={iconStyle} />,
    key: 'userProfile',
  },
  {
    label: (
      <span data-cy="user-menu-item" data-action="help">
        <Translation>{(t) => t('dashboard.topNavigation.help')}</Translation>
      </span>
    ),
    key: 'help',
    icon: <QuestionCircleOutlined style={iconStyle} />,
  },
  {
    label: (
      <span data-cy="user-menu-item" data-action="logout">
        <Translation>{(t) => t('dashboard.topNavigation.logOut')}</Translation>
      </span>
    ),
    key: 'logOut',
    icon: <LogoutOutlined style={iconStyle} />,
  },
];

export const superAdminItems = [
  {
    label: (
      <span data-cy="user-menu-item" data-action="system-updates">
        <Translation>{(t) => t('dashboard.topNavigation.systemUpdates')}</Translation>
      </span>
    ),
    key: 'systemUpdates',
    icon: <DeploymentUnitOutlined style={iconStyle} />,
  },
  ...userNameItems,
];
