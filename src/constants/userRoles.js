import { Translation } from 'react-i18next';

export const userRoles = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  GUEST: 'GUEST',
};

export const userRolesWithTranslation = [
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.admin')}</Translation>,
    key: 'ADMIN',
    value: userRoles.ADMIN,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.contributor')}</Translation>,
    key: 'CONTRIBUTOR',
    value: userRoles.CONTRIBUTOR,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.editor')}</Translation>,
    key: 'EDITOR',
    value: userRoles.EDITOR,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.guest')}</Translation>,
    key: 'GUEST',
    value: userRoles.GUEST,
  },
];
