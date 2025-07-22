import { useEffect } from 'react';

/**
 * Accepts an array of AbortController refs and aborts all on component unmount.
 *
 * @param controllerRefs Array of refs (created using `useRef<AbortController | null>()`)
 */
const useAbortControllersOnUnmount = (controllerRefs) => {
  useEffect(() => {
    return () => {
      controllerRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.abort();
        }
      });
    };
  }, []);
};

export default useAbortControllersOnUnmount;
