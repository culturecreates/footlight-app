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
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToMultipleDate')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.multipleDatesTooltip')}</Translation>,
  },
];

export const dateFrequencyOptions = [
  {
    value: 'Daily',
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.daily')}</Translation>,
  },
  {
    value: 'Weekly',
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekly')}</Translation>,
  },
  {
    value: 'Monthly',
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.monthly')}</Translation>,
  },
  {
    value: 'Custom',
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.custom')}</Translation>,
  },
];
