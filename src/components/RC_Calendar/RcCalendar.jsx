/* eslint react/no-multi-comp:0, no-console:0 */

import React from 'react';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import frFr from 'rc-calendar/lib/locale/fr_FR';
import enUS from 'rc-calendar/lib/locale/en_US';
import 'rc-calendar/assets/index.css';
import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';

import './rcCalendar.css';

function RcCalendar(props) {
  const { onStandaloneChange, onStandaloneSelect, selectedValue } = props;

  if (i18n?.language === 'en') {
    moment.locale('en');
  } else if (i18n?.language === 'fr') {
    moment.locale('fr');
  }

  const now = moment();

  const defaultCalendarValue = now.clone();
  defaultCalendarValue.add(-1, 'month');

  const formatStr = 'DD/MM/YYYY';

  document.getElementsByClassName('rc-calendar-range-middle').innerHTML = 'newtext';
  return (
    <RangeCalendar
      showToday={false}
      showWeekNumber={false}
      dateInputPlaceholder={i18n?.language === 'en' ? ['DD/MM/YYYY', 'DD/MM/YYYY'] : ['JJ/MM/AAAA', 'JJ/MM/AAAA']}
      locale={i18n?.language === 'en' ? enUS : i18n?.language === 'fr' && frFr}
      showOk={false}
      format={formatStr}
      onChange={onStandaloneChange}
      onSelect={onStandaloneSelect}
      selectedValue={selectedValue}
    />
  );
}

export default RcCalendar;
