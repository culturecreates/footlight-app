import { useState } from 'react';

export const useArtsDataLoader = (loadFn) => {
  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);

  const getArtsData = (id) => {
    setArtsDataLoading(true);
    loadFn({ entityId: id })
      .then((response) => {
        setArtsData(response?.data[0]);
        setArtsDataLoading(false);
      })
      .catch((error) => {
        setArtsDataLoading(false);
        console.log(error);
      });
  };

  return { artsData, setArtsData, artsDataLoading, getArtsData };
};
