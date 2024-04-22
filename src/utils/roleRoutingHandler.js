import { eventPublishState } from '../constants/eventPublishState';
import { userRoles } from '../constants/userRoles';

export const routinghandler = (user, calendarId, creatorId, publishState = '', isEntity = false, entityId) => {
  let entityAccess = false;
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  if (entityId) {
    user?.roles.forEach((calendar) => {
      calendar?.organizations?.forEach((organization) => {
        if (organization.entityId === entityId) {
          entityAccess = true;
        }
      });
      calendar?.people?.forEach((person) => {
        if (person?.entityId === entityId) {
          entityAccess = true;
        }
      });
    });
  }

  switch (calendar[0]?.role) {
    case userRoles.GUEST:
      if (user?.id === creatorId || entityAccess) {
        if (isEntity == false) {
          if (eventPublishState.DRAFT === publishState) return true;
          else return false;
        } else if (isEntity == true) return true;
      } else return false;
      break;
    case userRoles.CONTRIBUTOR:
      if (user?.id === creatorId || entityAccess) return true;
      else return false;
    case userRoles.EDITOR:
      return true;
    case userRoles.ADMIN:
      return true;
    default:
      return false;
  }
};
