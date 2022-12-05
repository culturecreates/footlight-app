import React, { useState } from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getinterfaceLanguage } from '../../../redux/reducer/interfaceLanguageSlice';

function Calendar({ children, allCalendarsData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const interfaceLanguage = useSelector(getinterfaceLanguage);

  const [open, setOpen] = useState(false);
  const items = allCalendarsData?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">
            {bilingual({ en: item?.name?.en, fr: item?.name?.fr, interfaceLanguage: interfaceLanguage })}
          </span>
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

  const handleOpenChange = (flag) => {
    if (allCalendarsData?.data?.length > 1) setOpen(flag);
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick,
      }}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
