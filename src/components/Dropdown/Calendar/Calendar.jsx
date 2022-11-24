import React from 'react';
import './calendar.css';
import { Dropdown } from 'antd';

function Calendar({ children }) {
  const sampleImage = (
    <img
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '73px',
      }}
      src={require('../../../assets/images/logo-tout-culture.png')}
    />
  );
  const items = [
    {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">Signé Laval</span>
          <span className="calendar-organisation-details">6 members </span>
        </span>
      ),
      key: '0',
      icon: sampleImage,
    },
    {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">Signé Laval</span>
          <span className="calendar-organisation-details">6 members </span>
        </span>
      ),
      key: '1',
      icon: sampleImage,
    },

    {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">Signé Laval</span>
          <span className="calendar-organisation-details">6 members </span>
        </span>
      ),
      key: '3',
      icon: sampleImage,
    },
  ];
  const onClick = ({ key }) => {
    //Set params after dashboard in route for the selected calendar
    console.log(key);
  };
  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
