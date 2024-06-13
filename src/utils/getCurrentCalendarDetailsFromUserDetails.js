export const getCurrentCalendarDetailsFromUserDetails = (user, calendarId) => {
  if (!user || !user?.roles) {
    return [];
  }

  return user?.roles?.filter((calendar) => calendar.calendarId === calendarId);
};
