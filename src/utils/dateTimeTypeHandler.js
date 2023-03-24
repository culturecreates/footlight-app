import moment from 'moment';
import { dateTypes } from '../constants/dateTypes';

export const dateTimeTypeHandler = (startDate, startDateTime, endDate, endDateTime, isRecurring) => {
  if (isRecurring) return dateTypes.MULTIPLE;
  else if ((startDate || startDateTime) && !endDate && !endDateTime) return dateTypes.SINGLE;
  else if ((startDate || startDateTime) && endDateTime && !endDate) {
    if (startDate && moment(startDate).isSame(endDateTime, 'day')) return dateTypes.SINGLE;
    else if (startDate && !moment(startDate).isSame(endDateTime, 'day')) return dateTypes.RANGE;
    else if (startDateTime && moment(startDateTime).isSame(endDateTime, 'day')) return dateTypes.SINGLE;
    else if (startDateTime && !moment(startDateTime).isSame(endDateTime, 'day')) return dateTypes.RANGE;
  } else if ((startDate || startDateTime) && !endDateTime && endDate) return dateTypes.RANGE;
};
