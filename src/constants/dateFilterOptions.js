import { Translation } from 'react-i18next';

export const dateFilterTypes = {
  ALL_EVENTS: 'ALL_EVENTS',
  PAST_EVENTS: 'PAST_EVENTS',
  UPCOMING_EVENTS: 'UPCOMING_EVENTS',
  DATE_RANGE: 'DATE_RANGE',
};

export const dateFilterOptions = [
  {
    type: dateFilterTypes.ALL_EVENTS,
    label: <Translation>{(t) => t('dashboard.events.filter.dates.allEvents')}</Translation>,
  },
  {
    type: dateFilterTypes.PAST_EVENTS,
    label: <Translation>{(t) => t('dashboard.events.filter.dates.pastEvents')}</Translation>,
  },
  {
    type: dateFilterTypes.UPCOMING_EVENTS,
    label: <Translation>{(t) => t('dashboard.events.filter.dates.upcomingEvents')}</Translation>,
  },
  {
    type: dateFilterTypes.DATE_RANGE,
    label: <Translation>{(t) => t('dashboard.events.filter.dates.dateRange')}</Translation>,
  },
];
