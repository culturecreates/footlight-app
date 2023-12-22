/* eslint react/no-multi-comp:0, no-console:0 */

import React from 'react';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import zhCN from 'rc-calendar/lib/locale/zh_CN';
import enUS from 'rc-calendar/lib/locale/en_US';
import 'rc-calendar/assets/index.css';

import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';

import './rcCalendar.css';

function RcCalendar() {
  const cn = location.search.indexOf('cn') !== -1;

  if (cn) {
    moment.locale('zh-cn');
  } else {
    moment.locale('en-gb');
  }

  const now = moment();
  if (cn) {
    now.utcOffset(8);
  } else {
    now.utcOffset(0);
  }

  const defaultCalendarValue = now.clone();
  defaultCalendarValue.add(-1, 'month');

  //   function newArray(start, end) {
  //     const result = [];
  //     for (let i = start; i < end; i++) {
  //       result.push(i);
  //     }
  //     return result;
  //   }

  //   function disabledDate(current) {
  //     const date = moment();
  //     date.hour(0);
  //     date.minute(0);
  //     date.second(0);
  //     return current.isBefore(date); // can not select days before today
  //   }

  //   function disabledTime(time, type) {
  //     console.log('disabledTime', time, type);
  //     if (type === 'start') {
  //       return {
  //         disabledHours() {
  //           const hours = newArray(0, 60);
  //           hours.splice(20, 4);
  //           return hours;
  //         },
  //         disabledMinutes(h) {
  //           if (h === 20) {
  //             return newArray(0, 31);
  //           } else if (h === 23) {
  //             return newArray(30, 60);
  //           }
  //           return [];
  //         },
  //         disabledSeconds() {
  //           return [55, 56];
  //         },
  //       };
  //     }
  //     return {
  //       disabledHours() {
  //         const hours = newArray(0, 60);
  //         hours.splice(2, 6);
  //         return hours;
  //       },
  //       disabledMinutes(h) {
  //         if (h === 20) {
  //           return newArray(0, 31);
  //         } else if (h === 23) {
  //           return newArray(30, 60);
  //         }
  //         return [];
  //       },
  //       disabledSeconds() {
  //         return [55, 56];
  //       },
  //     };
  //   }

  const formatStr = 'YYYY-MM-DD';
  function format(v) {
    return v ? v.format(formatStr) : '';
  }

  function onStandaloneChange(value) {
    console.log('onChange');
    console.log(value[0] && format(value[0]), value[1] && format(value[1]));
  }

  function onStandaloneSelect(value) {
    console.log('onSelect');
    console.log(format(value[0]), format(value[1]));
  }
  return (
    <RangeCalendar
      showToday={false}
      showWeekNumber={false}
      dateInputPlaceholder={['start', 'end']}
      locale={cn ? zhCN : enUS}
      showOk={false}
      format={formatStr}
      onChange={onStandaloneChange}
      onSelect={onStandaloneSelect}
    />
  );
}

export default RcCalendar;
