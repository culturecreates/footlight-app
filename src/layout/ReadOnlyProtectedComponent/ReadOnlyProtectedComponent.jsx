import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { userRoles } from '../../constants/userRoles';
import { getCurrentCalendarDetailsFromUserDetails } from '../../utils/getCurrentCalendarDetailsFromUserDetails';
import { eventPublishState } from '../../constants/eventPublishState';

function ReadOnlyProtectedComponent({ children, creator, entityId, isReadOnly, eventState }) {
  let { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  let entityAccess = false;

  if (user.isSuperAdmin) {
    return children;
  }

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  if (entityId) {
    user?.roles.forEach((calendar) => {
      calendar?.organizations?.forEach((organization) => {
        if (organization.entityId === entityId) {
          entityAccess = true;
        }
      });

      calendar?.people?.forEach((person) => {
        if (person.entityId === entityId) {
          entityAccess = true;
        }
      });
    });
  }
  if (isReadOnly) return;
  else
    switch (calendar[0]?.role) {
      case userRoles.GUEST: {
        const canAccess = user?.id === creator || entityAccess;
        if (!canAccess) return;
        if (eventState) {
          if (eventState === eventPublishState.PENDING_REVIEW) return;
          return children;
        }
        return children;
      }

      case userRoles.CONTRIBUTOR:
        return user?.id === creator || entityAccess ? children : undefined;

      case userRoles.EDITOR:
      case userRoles.ADMIN:
        return children;

      default:
        return;
    }
}

export default ReadOnlyProtectedComponent;
