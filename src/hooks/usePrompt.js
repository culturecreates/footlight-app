import { useCallback, useContext, useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { useBlocker } from 'react-router-dom';

function useConfirmExit(confirmExit, when = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) {
      return;
    }

    const push = navigator.push;
    const go = navigator.go;

    navigator.push = (...args) => {
      const result = confirmExit();
      if (result !== false) {
        push(...args);
      }
    };

    navigator.go = (...args) => {
      const result = confirmExit();
      if (result !== false) {
        go(...args);
      }
    };

    return () => {
      navigator.push = push;
      navigator.go = go;
    };
  }, [navigator, confirmExit, when]);
}

export function usePrompt(message, when = true) {
  useEffect(() => {
    if (when) {
      window.onbeforeunload = function () {
        return message;
      };
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [message, when]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      return message;
    };

    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
    };
  }, [message, when]);

  const confirmExit = useCallback(() => {
    const confirm = window.confirm(message);
    return confirm;
  }, [message]);
  useConfirmExit(confirmExit, when);
}

export function useCustomPrompt(message, shouldPrompt) {
  const retryFn = useRef(() => {});

  useEffect(() => {
    if (retryFn.current) {
      retryFn.current();
    }
  }, [retryFn.current]);

  const handleBlockNavigation = ({ retry }) => {
    const shouldDisplayPrompt = typeof shouldPrompt === 'boolean' ? shouldPrompt : shouldPrompt();

    if (shouldDisplayPrompt) {
      const leaveRoute = window.confirm(message);
      if (leaveRoute) {
        retryFn.current = retry;
      } else {
        retry();
      }
    } else {
      retry();
    }
  };

  useBlocker(handleBlockNavigation, true);
}
