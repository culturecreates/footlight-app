/* eslint react/no-multi-comp:0, no-console:0 */

import React, { useState } from 'react';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import frFr from 'rc-calendar/lib/locale/fr_FR';
import enUS from 'rc-calendar/lib/locale/en_US';
import 'rc-calendar/assets/index.css';
import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';
import PrimaryButton from '../Button/Primary';
import './rcCalendar.css';
import { useTranslation } from 'react-i18next';
import StyledInput from '../Input/Common';
import { CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Input } from 'antd';

function RcCalendar(props) {
  const { onStandaloneChange, selectedValue, onApply } = props;
  const { t } = useTranslation();
  const [currentSelectedDates, setCurrentSelectedDates] = useState(selectedValue);

  if (i18n?.language === 'en') {
    moment.locale('en');
  } else if (i18n?.language === 'fr') {
    moment.locale('fr');
  }

  const now = moment();

  const defaultCalendarValue = now.clone();
  defaultCalendarValue.add(-1, 'month');

  const formatStr = 'DD/MM/YYYY';

  const onSelect = (dates) => {
    setCurrentSelectedDates(dates);
  };

  return (
    <div className="rc-year-calendar-wrapper">
      <Input.Group compact>
        <StyledInput
          style={{
            width: '50%',
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderRight: '0px',
          }}
          placeholder={formatStr}
          defaultValue={currentSelectedDates?.length > 0 ? moment(currentSelectedDates[0]).format(formatStr) : ''}
          value={currentSelectedDates?.length > 0 ? moment(currentSelectedDates[0]).format(formatStr) : ''}
          onChange={(e) => {
            if (moment(e.target.value, formatStr).isValid()) {
              setCurrentSelectedDates([moment(e.target.value, formatStr), currentSelectedDates[1]]);
            }
          }}
          prefix={<CalendarOutlined style={{ color: '#1B3DE6' }} />}
          suffix={'>'}
          readOnly
        />

        <StyledInput
          readOnly
          style={{
            width: '50%',
            borderLeft: '0px',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
          }}
          placeholder={formatStr}
          onChange={(e) => {
            if (moment(e.target.value, formatStr).isValid()) {
              setCurrentSelectedDates([currentSelectedDates[0], moment(e.target.value, formatStr)]);
            }
          }}
          className="site-input-right"
          value={currentSelectedDates?.length > 1 ? moment(currentSelectedDates[1]).format(formatStr) : ''}
          suffix={
            currentSelectedDates?.length > 0 && (
              <CloseCircleOutlined style={{ color: '#1B3DE6' }} onClick={() => setCurrentSelectedDates([])} />
            )
          }
        />
      </Input.Group>
      <RangeCalendar
        showToday={false}
        showWeekNumber={false}
        dateInputPlaceholder={i18n?.language === 'en' ? ['DD/MM/YYYY', 'DD/MM/YYYY'] : ['JJ/MM/AAAA', 'JJ/MM/AAAA']}
        locale={i18n?.language === 'en' ? enUS : i18n?.language === 'fr' && frFr}
        showOk={false}
        showDateInput={false}
        renderFooter={() => (
          <PrimaryButton
            label={t('dashboard.events.addEditEvent.dates.modal.apply')}
            onClick={() => onApply(currentSelectedDates)}
            data-cy="button-save-date-range-dates-filter"
          />
        )}
        format={formatStr}
        onChange={onStandaloneChange}
        onSelect={onSelect}
        selectedValue={currentSelectedDates}
      />
    </div>
  );
}

export default RcCalendar;
