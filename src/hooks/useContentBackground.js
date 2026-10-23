import { useEffect } from 'react';
import { useDashboardContext } from './useDashboardContext';

export const useContentBackground = (color = '#F9FAFF') => {
  const { setContentBackgroundColor } = useDashboardContext();

  useEffect(() => {
    setContentBackgroundColor(color);
  }, [setContentBackgroundColor]);
};
