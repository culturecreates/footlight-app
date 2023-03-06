import React from 'react';
import './dateRangePicker.css';
import { DatePicker } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import i18n from 'i18next';

const { RangePicker } = DatePicker;
function DateRangePicker(props) {
  return (
    <RangePicker
      className="date-range-picker-wrapper"
      popupClassName="date-range-picker-calendar"
      size={'large'}
      format="DD/MM/YYYY"
      getPopupContainer={(trigger) => trigger.parentNode}
      placeholder={i18n?.language === 'en' ? ['MM/DD/YYYY', 'MM/DD/YYYY'] : ['JJ/MM/AAAA', 'JJ/MM/AAAA']}
      separator={<RightOutlined style={{ color: '#646D7B' }} />}
      {...props}
    />
  );
}

export default DateRangePicker;
