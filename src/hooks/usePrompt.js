import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker, useBeforeUnload, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const RouteLeavingGuard = ({ isBlocking }) => {
  function useCallbackPrompt(when) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();
    const [lastLocation, setLastLocation] = useState(null);
    const [confirmedNavigation, setConfirmedNavigation] = useState(false);

    const handleBlockedNavigation = useCallback(
      (history) => {
        if (!when || confirmedNavigation || history?.nextLocation?.pathname === location.pathname) {
          return false;
        }

        const confirm = window.confirm(`${t('common.unsavedChanges')}`);
        if (confirm) {
          setConfirmedNavigation(true);
          setLastLocation(history.nextLocation);
          return false;
        }

        return true;
      },
      [confirmedNavigation, location.pathname, when, t],
    );

    useEffect(() => {
      if (confirmedNavigation && lastLocation) {
        navigate(lastLocation.pathname, { state: location.state });
      }
    }, [confirmedNavigation, lastLocation, location.state, navigate]);

    useBlocker(handleBlockedNavigation, when);
  }

  useCallbackPrompt(isBlocking);

  return null;
};

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
