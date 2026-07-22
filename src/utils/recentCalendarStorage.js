const RECENT_CALENDAR_STORAGE_PREFIX = 'recentCalendar';

const getSafeLocalStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
};

const getUserIdentity = (user) => {
  if (!user) return 'anonymous';

  return user?.id || 'unknown-user';
};

const getRecentCalendarStorageKey = (user) => `${RECENT_CALENDAR_STORAGE_PREFIX}:${getUserIdentity(user)}`;

export const getRecentCalendarForUser = (user) => {
  const storage = getSafeLocalStorage();
  if (!storage) return '';

  try {
    const value = storage.getItem(getRecentCalendarStorageKey(user));
    if (!value) return '';
    return String(value);
  } catch {
    return '';
  }
};

export const setRecentCalendarForUser = ({ user, calendarId }) => {
  if (!calendarId) return;

  const storage = getSafeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(getRecentCalendarStorageKey(user), String(calendarId));
  } catch {
    // Ignore storage failures (private mode/quota) and keep runtime behavior unchanged.
  }
};

export const clearRecentCalendarForUser = (user) => {
  const storage = getSafeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(getRecentCalendarStorageKey(user));
  } catch {
    // Ignore storage failures.
  }
};
