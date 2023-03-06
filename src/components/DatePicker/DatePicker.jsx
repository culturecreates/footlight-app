import React from 'react';
import './datePicker.css';
import { DatePicker } from 'antd';
import i18n from 'i18next';

function DatePickerStyled(props) {
  return (
    <DatePicker
      format="DD/MM/YYYY"
      size="large"
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
