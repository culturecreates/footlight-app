import React from 'react';
import { TimePicker } from 'antd';
import './timePicker.css';

function TimePickerStyled(props) {
  return (
    <TimePicker
      className="time-picker-wrapper"
      popupClassName="time-picker-dropdown"
      showNow={false}
      format="h:mm a"
      use12Hours
      size="large"
      suffixIcon={false}
      minuteStep={15}
      getPopupContainer={(trigger) => trigger.parentNode}
      {...props}
    />
  );
}

export default TimePickerStyled;
