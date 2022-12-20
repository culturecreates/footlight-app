import React from 'react';
import './datePicker.css';
import { DatePicker } from 'antd';

function DatePickerStyled(props) {
  return (
    <DatePicker
      format="MM/DD/YYYY"
      size="large"
      className="date-picker-wrapper"
      {...props}
      placeholder="MM/DD/YYYY"
      showToday={false}
      popupClassName="date-picker-calendar"
    />
  );
}

export default DatePickerStyled;
