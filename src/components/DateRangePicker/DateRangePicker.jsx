import React from 'react';
import './dateRangePicker.css';
import { DatePicker } from 'antd';
import { RightOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;
function DateRangePicker(props) {
  return (
    <RangePicker
      className="date-range-picker-wrapper"
      popupClassName="date-range-picker-calendar"
      size={'large'}
      format="MM/DD/YYYY"
      getPopupContainer={(trigger) => trigger.parentNode}
      placeholder={['MM/DD/YYYY', 'MM/DD/YYYY']}
      separator={<RightOutlined style={{ color: '#646D7B' }} />}
      {...props}
    />
  );
}

export default DateRangePicker;
