import { userRoles } from '../constants/userRoles';

export const adminCheckHandler = ({ user, calendar }) => {
  if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
  else return false;
};
