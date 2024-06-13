import { userRoles } from '../constants/userRoles';

export const adminCheckHandler = ({ user, calendar }) => {
  if (user?.isSuperAdmin) return true;
  if (calendar[0]?.role === userRoles.ADMIN) return true;
  else return false;
};
