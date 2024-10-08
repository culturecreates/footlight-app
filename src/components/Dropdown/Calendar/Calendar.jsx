import React, { useState } from 'react';
import './calendar.css';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { setSelectedCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

function Calendar({ children, allCalendarsData, setPageNumber }) {
  const dispatch = useDispatch();
  const { user } = useSelector(getUserDetails);
  const calendarIdInCookies = sessionStorage.getItem('calendarId');

  const [open, setOpen] = useState(false);
  const items = allCalendarsData?.data?.map((item) => {
    const key = item?.id;
    return {
      label: (
        <span className="calendar-name-wrapper">
          <span className="calendar-name">
            {contentLanguageBilingual({
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: item?.contentLanguage,
              data: item?.name,
            })}
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
            objectFit: 'contain',
          }}
          src={item?.logo?.original?.uri}
        />
      ),
    };
  });
  const onClick = ({ key }) => {
    if (calendarIdInCookies != key) {
      dispatch(setSelectedCalendar(String(key)));
      sessionStorage.setItem('calendarId', key);
      setPageNumber(1);
      sessionStorage.clear();
      setOpen(false);
      const origin = window.location.origin;
      const newUrl = `${origin}${PathName.Dashboard}/${key}${PathName.Events}`;
      window.location.href = newUrl;
    }
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
      trigger={['click']}
      overlayClassName="calendar-dropdown">
      {children}
    </Dropdown>
  );
}

export default Calendar;
