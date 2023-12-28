import { Translation } from 'react-i18next';

export const eventStatus = {
  EventCancelled: 'CANCELLED',
  EventPostponed: 'POSTPONED',
  EventScheduled: 'SCHEDULED',
};

export const eventStatusOptions = [
  {
    value: eventStatus.EventScheduled,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.eventScheduled')}</Translation>,
  },
  {
    value: eventStatus.EventPostponed,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.eventPostponed')}</Translation>,
  },
  {
    value: eventStatus.EventCancelled,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.eventCancelled')}</Translation>,
  },
];
