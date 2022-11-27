import React from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useGetAllCalendarsQuery } from '../../../services/calendar';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';

function Calendar({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useGetAllCalendarsQuery();
  const items = data?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">{item?.name?.en}</span>
          <span className="calendar-organisation-details">{item?.organizationTypes?.length}&nbsp;members </span>
        </span>
      ),
      key: key,
      icon: (
        <img
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '73px',
          }}
          src={item?.image?.uri}
        />
      ),
    };
  });
  const onClick = ({ key }) => {
    //Set params after dashboard in route for the selected calendar
    navigate(`${PathName.Dashboard}/${key}${PathName.Events}`);
    dispatch(setSelectedCalendar(String(key)));
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
