import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { userRoles } from '../../constants/userRoles';

function ReadOnlyProtectedComponent({ children, creator }) {
  let { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  switch (calendar[0]?.role) {
    case userRoles.GUEST:
      if (user?.id === creator?.userId) return children;
      else return;
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

export default ReadOnlyProtectedComponent;
