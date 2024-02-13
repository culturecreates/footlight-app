import { useCallback, useContext, useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { useBlocker, useBeforeUnload } from 'react-router-dom';

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

export function useCustomPrompt(message, { beforeUnload } = {}) {
  let blocker = useBlocker(
    useCallback(() => (typeof message === 'string' ? !window.confirm(message) : false), [message]),
  );
  let prevState = useRef(blocker.state);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    prevState.current = blocker.state;
  }, [blocker]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (beforeUnload && typeof message === 'string') {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [message, beforeUnload],
    ),
    { capture: true },
  );
}

export function Prompt({ when, message, ...props }) {
  useCustomPrompt(when ? message : false, props);
  return null;
}
