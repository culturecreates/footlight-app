import moment from 'moment';

const weekDaysMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const getWeekDayDates = (schedule) => {
  const { startDate, endDate, weekDays } = schedule;
  const start = moment(startDate);
  const end = moment(endDate);
  const targetWeekDays = weekDays.map((day) => weekDaysMap[day.toLowerCase()]);

  let dates = [];
  let currentDate = moment(start);

  while (currentDate <= end) {
    if (targetWeekDays.includes(currentDate.day())) {
      dates.push(currentDate.format('YYYY-MM-DD'));
    }
    currentDate.add(1, 'days');
  }

  return dates.length > 0 ? dates[0] : startDate;
};
