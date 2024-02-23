import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { userRoles } from '../../constants/userRoles';

function ProtectedComponents({ children, creator, isEntity, isReadOnly }) {
  let { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  if (user?.isSuperAdmin) {
    return children;
  }

  const calendar = user?.roles?.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  if (isReadOnly) return;
  else
    switch (calendar[0]?.role) {
      case userRoles.GUEST:
        if (isEntity == true) {
          if (user?.id === creator?.userId) return children;
        } else return;
        break;
      case userRoles.CONTRIBUTOR:
        if (user?.id === creator?.userId) return children;
        else return;
      case userRoles.EDITOR:
        return children;
      case userRoles.ADMIN:
        return children;
      default:
        return;
    }
}

export default ProtectedComponents;
