import moment from 'moment';
import { dateTypes } from '../constants/dateTypes';

export const dateTimeTypeHandler = (startDate, startDateTime, endDate, endDateTime, isRecurring) => {
  if (isRecurring) return dateTypes.MULTIPLE;

  const start = startDateTime || startDate;
  const end = endDateTime || endDate;

  // only start is provided
  if (start && !end) return dateTypes.SINGLE;

  // if both start and end are present
  if (start && end) {
    // If start and end are the same day, or within 24 hours
    if (moment(start).isSame(end, 'day') || moment(end).diff(moment(start), 'hours') < 24) return dateTypes.SINGLE;

    return dateTypes.RANGE;
  }
};
