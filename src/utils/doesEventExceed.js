import moment from 'moment-timezone';

export const doesEventExceedNextDay = (startDateTime, endDateTime, timezone) => {
  if (startDateTime && endDateTime) {
    const start = moment.tz(startDateTime, timezone);
    const end = moment.tz(endDateTime, timezone);

    const exceedsToNextDay = end.isAfter(start) && !start.isSame(end, 'day');

    const isWithin24Hours = end.diff(start, 'hours') <= 24;

    return exceedsToNextDay && isWithin24Hours;
  }
};
