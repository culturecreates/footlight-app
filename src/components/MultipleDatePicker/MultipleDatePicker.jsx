import React, { useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import './multipleDatePicker.css';
const MultipleDatePicker = () => {
  //   const [selectedDate, setSelectedDate] = useState([]);
  //   const onPanelChange = (value, mode) => {
  //     console.log(value.format('YYYY-MM-DD'), mode);
  //   };
  //   const onValueChange = (date) => {
  //     const newDate = moment(date).startOf('day').valueOf();
  //     if (selectedDate.includes(newDate)) {
  //       setSelectedDate([...selectedDate.filter((item) => item !== newDate)]);
  //     } else {
  //       setSelectedDate([...selectedDate, newDate]);
  //     }
  //   };
  //   const dateRender = (currentDate) => {
  //     const isSelected = selectedDate.includes(moment(currentDate).startOf('day').valueOf());
  //     let selectStyle = isSelected
  //       ? {
  //           position: 'relative',
  //           zIndex: 2,
  //           display: 'inlineBlock',
  //           width: '24px',
  //           height: '22px',
  //           lineHeight: '22px',
  //           backgroundColor: '#1890ff',
  //           color: '#fff',
  //           margin: 'auto',
  //           borderRadius: '2px',
  //           transition: 'background 0.3s, border 0.3s',
  //         }
  //       : {};
  //     return <div style={selectStyle}> {currentDate.date()} </div>;
  //   };
  //   return (
  //     <div className="site-calendar-customize-header-wrapper">
  //       <Calendar
  //         fullscreen={false}
  //         headerRender={({ value, onTypeChange }) => {
  //           const start = 0;
  //           const end = 12;
  //           const monthOptions = [];
  //           const current = value.clone();
  //           const localeData = value.localeData();
  //           const months = [];
  //           for (let i = 0; i < 12; i++) {
  //             current.month(i);
  //             months.push(localeData.monthsShort(current));
  //           }
  //           for (let i = start; i < end; i++) {
  //             monthOptions.push(
  //               <Select.Option key={i} value={i} className="month-item">
  //                 {months[i]}
  //               </Select.Option>,
  //             );
  //           }
  //           const year = value.year();
  //           const month = value.month();
  //           const options = [];
  //           for (let i = year - 10; i < year + 100; i += 1) {
  //             options.push(
  //               <Select.Option key={i} value={i} className="year-item">
  //                 {i}
  //               </Select.Option>,
  //             );
  //           }
  //           return (
  //             <div
  //               style={{
  //                 padding: 8,
  //               }}>
  //               <Row gutter={8}>
  //                 <Col>{'<'}</Col>
  //                 <Col>{'<<'}</Col>
  //                 <Col>
  //                   <div onClick={onTypeChange} value="year">{month}</div>
  //                 </Col>
  //                 <Col>{year}</Col>
  //                 <Col>{'>'}</Col>
  //                 <Col>{'>>'}</Col>
  //               </Row>
  //             </div>
  //           );
  //         }}
  //         onPanelChange={onPanelChange}
  //         dateFullCellRender={dateRender}
  //         onSelect={onValueChange}
  //       />
  //     </div>
  //   );

  // 选中的日期 timestamp[]
  const [selectedDate, setSelectedDate] = useState([]);

  // 日期发生变化时 重复去重 没有则添加
  const onValueChange = (date) => {
    const newDate = moment(date).startOf('day').valueOf();
    if (selectedDate.includes(newDate)) {
      setSelectedDate([...selectedDate.filter((item) => item !== newDate)]);
    } else {
      setSelectedDate([...selectedDate, newDate]);
    }
  };

  // 渲染选中日期外观
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
    <>
      <div>
        <DatePicker open dateRender={dateRender} onChange={onValueChange} showToday={false} value={''} />
      </div>
    </>
  );
};
export default MultipleDatePicker;
