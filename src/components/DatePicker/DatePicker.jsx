import React from 'react';
import './datePicker.css';
import { DatePicker } from 'antd';
import i18n from 'i18next';
import 'moment/locale/fr-ca';
import frLocale from 'antd/es/date-picker/locale/fr_CA';
import enLocale from 'antd/es/date-picker/locale/en_US';

function DatePickerStyled(props) {
  const handleDateChange = (value) => {
    if (value && value.isValid()) {
      datePickerRef.current.blur();
    }
    if (props.onChange) {
      props.onChange(value);
    }
  };

  const datePickerRef = React.createRef();

  return (
    <DatePicker
      ref={datePickerRef}
      format="DD/MM/YYYY"
      size="large"
      locale={i18n?.language === 'en' ? enLocale : i18n?.language === 'fr' && frLocale}
      className="date-picker-wrapper"
      {...props}
      changeOnBlur={true}
      placeholder={i18n?.language === 'en' ? 'DD/MM/YYYY' : 'JJ/MM/AAAA'}
      showToday={false}
      popupClassName="date-picker-calendar"
      getPopupContainer={(trigger) => trigger.parentNode}
      onChange={handleDateChange}
    />
  );
}

export default DatePickerStyled;
