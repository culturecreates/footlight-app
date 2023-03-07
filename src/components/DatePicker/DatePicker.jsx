import React from 'react';
import './datePicker.css';
import { DatePicker } from 'antd';
import i18n from 'i18next';
import frLocale from 'antd/es/date-picker/locale/fr_CA';
import enLocale from 'antd/es/date-picker/locale/en_US';

function DatePickerStyled(props) {
  return (
    <DatePicker
      format="DD/MM/YYYY"
      size="large"
      locale={i18n?.language === 'en' ? enLocale : i18n?.language === 'fr' && frLocale}
      className="date-picker-wrapper"
      {...props}
      placeholder={i18n?.language === 'en' ? 'DD/MM/YYYY' : 'JJ/MM/AAAA'}
      showToday={false}
      popupClassName="date-picker-calendar"
      getPopupContainer={(trigger) => trigger.parentNode}
    />
  );
}

export default DatePickerStyled;
