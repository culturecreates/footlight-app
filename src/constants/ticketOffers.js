import { Translation } from 'react-i18next';

export const offerTypes = {
  FREE: 'FREE',
  PAYING: 'PAYING',
};

export const offerTypeOptions = [
  {
    type: offerTypes.FREE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToFree')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToFreeTooltip')}</Translation>,
  },
  {
    type: offerTypes.PAYING,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToPaid')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToPaidTooltip')}</Translation>,
  },
];
