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
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.singleDateTooltip')}</Translation>,
  },
  {
    type: dateTypes.RANGE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToDateRange')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.dateRangeTooltip')}</Translation>,
  },
  {
    type: dateTypes.MULTIPLE,
    disabled: true,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToMultipleDate')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.multipleDatesTooltip')}</Translation>,
  },
];
