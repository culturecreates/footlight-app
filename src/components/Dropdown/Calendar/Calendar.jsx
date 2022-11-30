import React from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual } from '../../../utils/bilingual';

function Calendar({ children, allCalendarsData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = allCalendarsData?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">{bilingual({ en: item?.name?.en, fr: item?.name?.fr })}</span>
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
