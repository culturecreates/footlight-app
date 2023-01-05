import { Translation } from 'react-i18next';

export const dateTypes = {
  SINGLE: 'single',
  RANGE: 'range',
  MULTIPLE: 'multiple',
};

export const dateTypeOptions = [
  {
    type: dateTypes.SINGLE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToSingleDate')}</Translation>,
  },
  {
    type: dateTypes.RANGE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToDateRange')}</Translation>,
  },
  {
    type: dateTypes.MULTIPLE,
    disabled: true,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToMultipleDate')}</Translation>,
  },
];
