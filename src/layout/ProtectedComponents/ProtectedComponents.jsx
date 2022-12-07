import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { userRoles } from '../../constants/userRoles';

function ProtectedComponents({ children }) {
  let { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  if (calendar[0]?.role === userRoles.GUEST) return;
  else if (
    calendar[0]?.role === userRoles.CONTRIBUTOR ||
    calendar[0]?.role === userRoles.ADMIN ||
    calendar[0]?.role === userRoles.EDITOR
  )
    return children;
}

export default ProtectedComponents;
