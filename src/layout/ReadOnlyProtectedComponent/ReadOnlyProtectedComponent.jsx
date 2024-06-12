import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { userRoles } from '../../constants/userRoles';
import { getCurrentCalendarDetailsFromUserDetails } from '../../utils/getCurrentCalendarDetailsFromUserDetails';

function ReadOnlyProtectedComponent({ children, creator, entityId, isReadOnly }) {
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
      case userRoles.GUEST:
        if (user?.id === creator || entityAccess) return children;
        else return;
      case userRoles.CONTRIBUTOR:
        if (user?.id === creator || entityAccess) return children;
        else return;
      case userRoles.EDITOR:
        return children;
      case userRoles.ADMIN:
        return children;

      default:
        return;
    }
}

export default ReadOnlyProtectedComponent;
