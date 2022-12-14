import { userRoles } from '../constants/userRoles';

export const routinghandler = (user, calendarId, creatorId) => {
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  switch (calendar[0]?.role) {
    case userRoles.GUEST:
      if (user?.id === creatorId) return true;
      else return false;
    case userRoles.CONTRIBUTOR:
      if (user?.id === creatorId) return true;
      else return false;
    case userRoles.EDITOR:
      return true;
    case userRoles.ADMIN:
      return true;
    default:
      return false;
  }
};
