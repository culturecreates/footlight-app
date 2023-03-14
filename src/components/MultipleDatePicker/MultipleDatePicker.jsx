import { Calendar, Col, Radio, Row, Select, Typography } from 'antd';
import React, { useState } from 'react';
import moment from 'moment';
const MultipleDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState([]);

  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };
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
          width: '24px',
          height: '22px',
          lineHeight: '22px',
          backgroundColor: '#1890ff',
          color: '#fff',
          margin: 'auto',
          borderRadius: '2px',
          transition: 'background 0.3s, border 0.3s',
        }
      : {};
    return <div style={selectStyle}> {currentDate.date()} </div>;
  };
  return (
    <div className="site-calendar-customize-header-wrapper">
      <Calendar
        fullscreen={false}
        headerRender={({ value, type, onChange, onTypeChange }) => {
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
          for (let i = year - 10; i < year + 10; i += 1) {
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
              <Typography.Title level={4}>Custom header</Typography.Title>
              <Row gutter={8}>
                <Col>
                  <Radio.Group size="small" onChange={(e) => onTypeChange(e.target.value)} value={type}>
                    <Radio.Button value="month">Month</Radio.Button>
                    <Radio.Button value="year">Year</Radio.Button>
                  </Radio.Group>
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
              </Row>
            </div>
          );
        }}
        onPanelChange={onPanelChange}
        dateFullCellRender={dateRender}
        onChange={onValueChange}
      />
    </div>
  );
};
export default MultipleDatePicker;
