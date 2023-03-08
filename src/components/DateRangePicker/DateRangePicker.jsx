import React from 'react';
import './dateRangePicker.css';
import { DatePicker } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import i18n from 'i18next';
import 'moment/locale/fr-ca';
import frLocale from 'antd/es/date-picker/locale/fr_CA';
import enLocale from 'antd/es/date-picker/locale/en_US';

const { RangePicker } = DatePicker;
function DateRangePicker(props) {
  return (
    <RangePicker
      className="date-range-picker-wrapper"
      popupClassName="date-range-picker-calendar"
      size={'large'}
      format="DD/MM/YYYY"
      locale={i18n?.language === 'en' ? enLocale : i18n?.language === 'fr' && frLocale}
      getPopupContainer={(trigger) => trigger.parentNode}
      placeholder={i18n?.language === 'en' ? ['MM/DD/YYYY', 'MM/DD/YYYY'] : ['JJ/MM/AAAA', 'JJ/MM/AAAA']}
      separator={<RightOutlined style={{ color: '#646D7B' }} />}
      {...props}
    />
  );
}

export default DateRangePicker;
