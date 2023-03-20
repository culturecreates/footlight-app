import React, { useState } from 'react';
import { Select, Calendar, Col, Row } from 'antd';
import moment from 'moment';
import './multipleDatePicker.css';
import i18n from 'i18next';
import 'moment/locale/fr-ca';
import frLocale from 'antd/es/date-picker/locale/fr_CA';
import enLocale from 'antd/es/date-picker/locale/en_US';
const MultipleDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState([]);

  const onValueChange = (date) => {
    const newDate = moment(date).startOf('day').valueOf();
    if (selectedDate.includes(newDate)) {
      setSelectedDate([...selectedDate.filter((item) => item !== newDate)]);
    } else {
      setSelectedDate([...selectedDate, newDate]);
    }
  };
  const dateRender = (currentDate) => {
    const isSelected = selectedDate.includes(moment(currentDate).startOf('day').valueOf());
    let selectStyle = isSelected
      ? {
          position: 'relative',
          zIndex: 2,
          display: 'inlineBlock',
          width: '32px',
          height: '32px',
          lineHeight: '32px',
          backgroundColor: '#607EFC',
          color: '#fff',
          margin: 'auto',
          borderRadius: '4px',
          transition: 'background 0.3s, border 0.3s',
        }
      : {};
    return <div style={selectStyle}> {currentDate.date()} </div>;
  };
  return (
    <div className="site-calendar-customize-header-wrapper">
      <Calendar
        locale={i18n?.language === 'en' ? enLocale : i18n?.language === 'fr' && frLocale}
        fullscreen={false}
        headerRender={({ value, onChange }) => {
          const start = 0;
          const end = 12;
          const monthOptions = [];
          const current = value.clone();
          const localeData = value.localeData();
          const months = [];
          for (let i = 0; i < 12; i++) {
            current.month(i);
            months.push(localeData.monthsShort(current));
          }
          for (let i = start; i < end; i++) {
            monthOptions.push(
              <Select.Option key={i} value={i} className="month-item">
                {months[i]}
              </Select.Option>,
            );
          }
          const year = value.year();
          const month = value.month();
          const options = [];
          for (let i = year - 10; i < year + 100; i += 1) {
            options.push(
              <Select.Option key={i} value={i} className="year-item">
                {i}
              </Select.Option>,
            );
          }
          return (
            <div
              style={{
                padding: 8,
              }}>
              <Row gutter={8}>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    value={month}
                    onChange={(newMonth) => {
                      const now = value.clone().month(newMonth);
                      onChange(now);
                    }}>
                    {monthOptions}
                  </Select>
                </Col>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    className="my-year-select"
                    value={year}
                    onChange={(newYear) => {
                      const now = value.clone().year(newYear);
                      onChange(now);
                    }}>
                    {options}
                  </Select>
                </Col>
              </Row>
            </div>
          );
        }}
        dateFullCellRender={dateRender}
        onSelect={onValueChange}
      />
    </div>
  );

  // 选中的日期 timestamp[]
  // const [selectedDate, setSelectedDate] = useState([]);

  // // 日期发生变化时 重复去重 没有则添加
  // const onValueChange = (date) => {
  //   const newDate = moment(date).startOf('day').valueOf();
  //   if (selectedDate.includes(newDate)) {
  //     setSelectedDate([...selectedDate.filter((item) => item !== newDate)]);
  //   } else {
  //     setSelectedDate([...selectedDate, newDate]);
  //   }
  // };

  // // 渲染选中日期外观
  // const dateRender = (currentDate) => {
  //   const isSelected = selectedDate.includes(moment(currentDate).startOf('day').valueOf());
  //   let selectStyle = isSelected
  //     ? {
  //         position: 'relative',
  //         zIndex: 2,
  //         display: 'inlineBlock',
  //         width: '24px',
  //         height: '22px',
  //         lineHeight: '22px',
  //         backgroundColor: '#1890ff',
  //         color: '#fff',
  //         margin: 'auto',
  //         borderRadius: '2px',
  //         transition: 'background 0.3s, border 0.3s',
  //       }
  //     : {};
  //   return <div style={selectStyle}> {currentDate.date()} </div>;
  // };

  // return (
  //   <>
  //     <div>
  //       <DatePicker open dateRender={dateRender} onChange={onValueChange} showToday={false} value={''} />
  //     </div>
  //   </>
  // );
};
export default MultipleDatePicker;
