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
    label: (
      <Translation>
        {(t) => {
          return (
            <>
              {t('dashboard.events.addEditEvent.dates.changeToSingleDate1')}
              <br />
              {t('dashboard.events.addEditEvent.dates.changeToSingleDate2')}
            </>
          );
        }}
      </Translation>
    ),
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.singleDateTooltip')}</Translation>,
  },
  {
    type: dateTypes.RANGE,
    disabled: false,
    label: (
      <Translation>
        {(t) => {
          return (
            <>
              {t('dashboard.events.addEditEvent.dates.changeToDateRange1')}
              <br />
              {t('dashboard.events.addEditEvent.dates.changeToDateRange2')}
            </>
          );
        }}
      </Translation>
    ),
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.dateRangeTooltip')}</Translation>,
  },
  {
    type: dateTypes.MULTIPLE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.changeToMultipleDate')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.multipleDatesTooltip')}</Translation>,
  },
];

export const dateFrequencyTypes = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  CUSTOM: 'CUSTOM',
};

export const dateFrequencyOptions = [
  {
    value: dateFrequencyTypes.DAILY,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.daily')}</Translation>,
  },
  {
    value: dateFrequencyTypes.WEEKLY,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekly')}</Translation>,
  },
  {
    value: dateFrequencyTypes.CUSTOM,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.custom')}</Translation>,
  },
];

export const daysOfWeek = [
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.monday')}</Translation>,
    value: 'Monday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.tuesday')}</Translation>,
    value: 'Tuesday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.wednesday')}</Translation>,
    value: 'Wednesday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.thursday')}</Translation>,
    value: 'Thursday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.friday')}</Translation>,
    value: 'Friday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.saturday')}</Translation>,
    value: 'saturday',
  },
  {
    name: <Translation>{(t) => t('dashboard.events.addEditEvent.dates.weekDays.sunday')}</Translation>,
    value: 'sunday',
  },
];
