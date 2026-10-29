import { useEffect, useState } from 'react';
import { useLazyGetEntityDependencyDetailsQuery } from '../services/entities';

export const useEntityDerivedData = ({
  entityId,
  calendarId,
  timestampRef,
  relatedKeys = ['events', 'people', 'organizations', 'places'],
}) => {
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });

  useEffect(() => {
    if (entityId) {
      getDerivedEntities({ id: entityId, calendarId }).then((response) => {
        if (relatedKeys.some((key) => response?.data?.[key]?.length > 0)) {
          setDerivedEntitiesData(response?.data);
          setDerivedEntitiesDisplayStatus(true);
        }
      });
    }
  }, [entityId]);

  return { derivedEntitiesData, derivedEntitiesDisplayStatus, isEntityDetailsLoading };
};
