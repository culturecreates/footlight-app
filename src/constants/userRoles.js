import { Translation } from 'react-i18next';

export const userRoles = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  GUEST: 'GUEST',
  SUPER_ADMIN: 'SUPER ADMIN',
};

export const userRolesWithTranslation = [
  { label: <Translation>{(t) => t('dashboard.settings.userManagement.admin')}</Translation>, key: 'ADMIN' },
  { label: <Translation>{(t) => t('dashboard.settings.userManagement.contributor')}</Translation>, key: 'CONTRIBUTOR' },
  { label: <Translation>{(t) => t('dashboard.settings.userManagement.editor')}</Translation>, key: 'EDITOR' },
  { label: <Translation>{(t) => t('dashboard.settings.userManagement.guest')}</Translation>, key: 'GUEST' },
  { label: <Translation>{(t) => t('dashboard.settings.userManagement.superAdmin')}</Translation>, key: 'SUPER ADMIN' },
];
