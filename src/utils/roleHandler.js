import { Translation } from 'react-i18next';
import { userRoles } from '../constants/userRoles';

export const roleHandler = ({ roles, calendarId }) => {
  const requiredRole = roles.filter((r) => {
    return r.calendarId === calendarId;
  });
  let role = '';
  switch (requiredRole[0]?.role) {
    case userRoles.ADMIN:
      role = <Translation>{(t) => t('dashboard.settings.userManagement.admin')}</Translation>;
      break;
    case userRoles.CONTRIBUTOR:
      role = <Translation>{(t) => t('dashboard.settings.userManagement.contributor')}</Translation>;
      break;

    case userRoles.EDITOR:
      role = <Translation>{(t) => t('dashboard.settings.userManagement.editor')}</Translation>;
      break;

    case userRoles.GUEST:
      role = <Translation>{(t) => t('dashboard.settings.userManagement.guest')}</Translation>;
      break;

    default:
      break;
  }
  return role;
};
