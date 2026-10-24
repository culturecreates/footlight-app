import { useEffect, useState } from 'react';

export const useDebouncedLoading = (isAnyLoading) => {
  const [debouncedLoading, setDebouncedLoading] = useState(true);

  useEffect(() => {
    if (isAnyLoading) {
      setDebouncedLoading(true);
    } else {
      const timer = setTimeout(() => {
        setDebouncedLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAnyLoading]);

  return debouncedLoading;
};
