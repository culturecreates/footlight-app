import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import { useDashboardContext } from './useDashboardContext';

export const useReadOnlyRedirect = ({ entityId, entityPath, calendarId }) => {
  const navigate = useNavigate();
  const { isReadOnly } = useDashboardContext();

  useEffect(() => {
    if (isReadOnly) {
      if (entityId) navigate(`${PathName.Dashboard}/${calendarId}${entityPath}/${entityId}`, { replace: true });
      else navigate(`${PathName.Dashboard}/${calendarId}${entityPath}`, { replace: true });
    }
  }, [isReadOnly]);
};
